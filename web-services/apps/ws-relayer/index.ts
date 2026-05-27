import type { ServerWebSocket } from "bun";
import { Client as SSHClient } from "ssh2";
import { type JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

interface Session {
  userId: string;
  allowedVM: string;
  privateKey: string;
  expiresAt: number;
}

interface Connection {
  ssh: SSHClient;
  stream: import("ssh2").ClientChannel;
}

const connections = new Map<ServerWebSocket, Connection>();
const userSessions = new WeakMap<ServerWebSocket, Session>();
const allClients = new Set<ServerWebSocket>();
// Map pubkey -> set of subscribed clients for filtered indexer events
const pubkeySubscriptions = new Map<string, Set<ServerWebSocket>>();

type incomingMessage = {
  type:
    | "authenticate"
    | "connect"
    | "command"
    | "disconnect"
    | "subscribe-indexer";
  token?: string;
  pubkey?: string;
  config?: {
    host: string;
    port?: number;
    username: string;
  };
  command?: string;
};

const SSH_READY_TIMEOUT_MS = 10000;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || "changeme";

Bun.serve({
  fetch(req, server) {
    const url = new URL(req.url);

    // HTTP POST endpoint for indexer events
    if (req.method === "POST" && url.pathname === "/indexer-event") {
      if (req.headers.get("x-indexer-token") !== INDEXER_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
      }
      return req
        .json()
        .then((body) => {
          const message = JSON.stringify({ type: "indexer-event", data: body });
          const accounts: string[] = body.accounts || [];

          // Find clients subscribed to any account in this event
          const targetClients = new Set<ServerWebSocket>();
          for (const account of accounts) {
            const subs = pubkeySubscriptions.get(account);
            if (subs) {
              for (const client of subs) targetClients.add(client);
            }
          }

          console.log(
            `[WS-Relayer] Broadcasting ${body.instruction} to ${targetClients.size} clients`,
          );

          for (const client of targetClients) {
            try {
              client.send(message);
            } catch (_) {
              allClients.delete(client);
            }
          }
          return new Response("ok", { status: 200 });
        })
        .catch(() => new Response("Invalid JSON", { status: 400 }));
    }

    // Health check
    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({ status: "ok", clients: allClients.size }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    message(ws, message) {
      try {
        const data: incomingMessage = JSON.parse(message.toString());

        if (data.type === "authenticate") {
          authenticateUser(ws as ServerWebSocket<undefined>, data.token!);
        } else if (data.type === "subscribe-indexer") {
          // Subscribe this client to indexer events for their pubkey
          const pubkey = data.pubkey;
          if (pubkey) {
            if (!pubkeySubscriptions.has(pubkey)) {
              pubkeySubscriptions.set(pubkey, new Set());
            }
            pubkeySubscriptions
              .get(pubkey)!
              .add(ws as ServerWebSocket<undefined>);
            ws.send(JSON.stringify({ type: "subscribed", pubkey }));
          }
        } else if (data.type === "connect") {
          connectToVM(ws as ServerWebSocket<undefined>, data.config!);
        } else if (data.type === "command") {
          sendCommand(ws as ServerWebSocket<undefined>, data.command!);
        } else if (data.type === "disconnect") {
          disconnectFromVM(ws as ServerWebSocket<undefined>);
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }
    },
    open(ws) {
      allClients.add(ws as ServerWebSocket<undefined>);
      ws.send(
        JSON.stringify({
          type: "status",
          message: "Connected to WebSocket. Please authenticate.",
        }),
      );
    },
    close(ws) {
      allClients.delete(ws as ServerWebSocket<undefined>);
      // Remove from pubkey subscriptions
      for (const [, subs] of pubkeySubscriptions) {
        subs.delete(ws as ServerWebSocket<undefined>);
      }
      disconnectFromVM(ws as ServerWebSocket<undefined>);
    },
  },
  port: 9093,
});

function authenticateUser(ws: ServerWebSocket<undefined>, token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (
      !decoded ||
      !decoded.userId ||
      !decoded.privateKey ||
      !decoded.exp ||
      !decoded.allowedVms
    ) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      return;
    }
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      ws.send(JSON.stringify({ type: "error", message: "Token expired" }));
      return;
    }
    userSessions.set(ws, {
      userId: decoded.userId,
      allowedVM: decoded.allowedVms,
      privateKey: decoded.privateKey,
      expiresAt: decoded.exp * 1000,
    });

    ws.send(
      JSON.stringify({
        type: "authenticated",
        message: "Authentication successful",
        allowedVMs: decoded.allowedVms,
      }),
    );
  } catch (err) {
    ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
  }
}

function isAuthenticated(ws: ServerWebSocket<undefined>): boolean {
  const session = userSessions.get(ws);
  if (!session) return false;

  if (session.expiresAt && session.expiresAt < Date.now()) {
    userSessions.delete(ws);
    return false;
  }

  return true;
}

function canAccessVM(ws: ServerWebSocket<undefined>, vmHost: string): boolean {
  const session = userSessions.get(ws);
  if (!session) return false;

  return session.allowedVM.includes(vmHost) || session.allowedVM.includes("*");
}

function connectToVM(
  ws: ServerWebSocket<undefined>,
  config: {
    host: string;
    port?: number;
    username: string;
  },
) {
  if (!isAuthenticated(ws)) {
    ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
    return;
  }

  if (!canAccessVM(ws, config.host)) {
    ws.send(
      JSON.stringify({ type: "error", message: "Access denied to this VM" }),
    );
    return;
  }

  const session = userSessions.get(ws)!;
  const ssh = new SSHClient();

  let cleanedUp = false;
  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    connections.delete(ws);
    ssh.removeAllListeners();
    ssh.end();
  }

  ssh.on("ready", () => {
    ws.send(JSON.stringify({ type: "status", message: "SSH connected" }));

    ssh.shell((err, stream) => {
      if (err) {
        ws.send(JSON.stringify({ type: "error", message: err.message }));
        return cleanup();
      }

      connections.set(ws, { ssh, stream });

      stream.on("data", (data: Buffer) => {
        ws.send(
          JSON.stringify({
            type: "output",
            data: data.toString(),
          }),
        );
      });

      stream.on("close", () => {
        ws.send(
          JSON.stringify({ type: "status", message: "SSH session closed" }),
        );
        cleanup();
      });

      stream.stderr.on("data", (data: Buffer) => {
        ws.send(
          JSON.stringify({
            type: "error",
            data: data.toString(),
          }),
        );
      });
    });
  });

  ssh.on("error", (err) => {
    ws.send(JSON.stringify({ type: "error", message: err.message }));
    cleanup();
  });

  ssh.on("close", () => {
    cleanup();
  });

  ssh.connect({
    host: config.host,
    port: config.port || 22,
    username: config.username,
    privateKey: session.privateKey,
    readyTimeout: SSH_READY_TIMEOUT_MS,
  });
}

function sendCommand(ws: ServerWebSocket, command: string) {
  if (!isAuthenticated(ws)) {
    ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
    return;
  }

  const connection = connections.get(ws);
  if (!connection?.stream || connection.stream.destroyed) {
    ws.send(
      JSON.stringify({ type: "error", message: "No active SSH connection" }),
    );
    return;
  }

  connection.stream.write(command + "\n");
}

function disconnectFromVM(ws: ServerWebSocket) {
  const connection = connections.get(ws);
  if (connection) {
    if (connection.stream) {
      connection.stream.end();
    }
    if (connection.ssh) {
      connection.ssh.end();
    }
    connections.delete(ws);
  }

  userSessions.delete(ws);
}
