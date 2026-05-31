import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { loadConfig, WS_ENDPOINT, type AgentConfig } from "../config";
import { caddyAddRoute, caddyRemoveRoute } from "../utils/caddy";
import { readState, writeState, addJob, removeJob } from "../utils/state";
import { startTunnel, checkCloudflared } from "../utils/tunnel";
import { join } from "path";
import { homedir } from "os";

const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_RECONNECT_DELAY_MS = 60_000;
const HEALTH_CHECK_TIMEOUT_MS = 15_000;
const HEALTH_CHECK_INTERVAL_MS = 2_000;
const LOCK_FILE = join(homedir(), ".axion", "agent.lock");

let activeWs: WebSocket | null = null;
let currentConfig: AgentConfig | null = null;

// ── Lock (1 agent per machine) ──────────────────────────────────────────

function checkLock() {
  if (existsSync(LOCK_FILE)) {
    const pid = readFileSync(LOCK_FILE, "utf-8").trim();
    try {
      process.kill(parseInt(pid), 0);
      console.error(`\n  Agent already running (PID: ${pid})`);
      process.exit(1);
    } catch {
      unlinkSync(LOCK_FILE);
    }
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  process.on("exit", () => {
    try {
      unlinkSync(LOCK_FILE);
    } catch {}
  });
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

// ── Health Check (via axion-caddy container which shares axion-net) ──────

async function waitForContainer(
  containerName: string,
  port: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < HEALTH_CHECK_TIMEOUT_MS) {
    try {
      execSync(
        `docker exec axion-caddy wget -q -O /dev/null --spider --timeout=3 http://${containerName}:${port}/`,
        { stdio: "pipe", timeout: 5000 },
      );
      return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, HEALTH_CHECK_INTERVAL_MS));
  }
  return false;
}

// ── Docker ──────────────────────────────────────────────────────────────

function startJob(msg: any, config: AgentConfig) {
  const { jobId, dockerImage, containerPort, subdomain, env } = msg;
  if (!jobId || !dockerImage) return;

  console.log(`  [job] Starting: ${jobId} (${dockerImage})`);
  sendStatus(jobId, "CREATING", config);

  const containerName = `axion-dpl-${jobId}`;
  const port = containerPort || 80;

  try {
    execSync(`docker rm -f ${containerName}`, { stdio: "ignore" });
  } catch {}

  const args = [
    "run",
    "-d",
    "--name",
    containerName,
    "--network",
    "axion-net",
    "--restart",
    "unless-stopped",
    "--label",
    "axion.job=true",
  ];
  if (env) {
    if (Array.isArray(env)) {
      // string[] format: ["KEY=VAL", "KEY2=VAL2"]
      for (const e of env) {
        if (typeof e === "string" && e.includes("=")) args.push("-e", e);
      }
    } else {
      // Record<string,string> format: { KEY: "VAL" }
      for (const [k, v] of Object.entries(env)) args.push("-e", `${k}=${v}`);
    }
  }
  args.push(dockerImage);

  sendStatus(jobId, "BOOTING", config);

  const proc = spawn("docker", args, { stdio: "pipe" });
  let cid = "";
  proc.stdout.on("data", (d: Buffer) => {
    cid = d.toString().trim();
  });

  proc.on("close", async (code) => {
    if (code !== 0 || !cid) {
      console.error(`  [job] Failed: ${jobId}`);
      sendStatus(jobId, "DELETED", config);
      return;
    }

    console.log(`  [job] Container started: ${cid.slice(0, 12)}`);

    // Health check: wait for container to respond on expected port
    const healthy = await waitForContainer(containerName, port);
    if (!healthy) {
      console.error(
        `  [job] Health check failed: ${jobId} not responding on port ${port}`,
      );
      execSync(`docker rm -f ${containerName}`, { stdio: "ignore" });
      sendStatus(jobId, "DELETED", config);
      return;
    }

    // Add Caddy route
    try {
      await caddyAddRoute(jobId, subdomain, containerName, port);
      console.log(
        `  [job] Caddy route: ${subdomain} \u2192 ${containerName}:${port}`,
      );
    } catch (err) {
      console.error(`  [job] Caddy route failed:`, err);
      execSync(`docker rm -f ${containerName}`, { stdio: "ignore" });
      sendStatus(jobId, "DELETED", config);
      return;
    }

    // Save state
    addJob({
      jobId,
      containerName,
      domain: subdomain,
      port,
      status: "RUNNING",
    });

    console.log(`  [job] Running: ${jobId} \u2192 ${subdomain}`);
    sendStatus(jobId, "RUNNING", config);
  });
}

function endJob(msg: any, config: AgentConfig) {
  const { jobId } = msg;
  if (!jobId) return;

  if (jobId === "all") {
    console.log("  [job] Stopping all containers (deactivated)");
    stopAllContainers();
    return;
  }

  console.log(`  [job] Stopping: ${jobId}`);
  const containerName = `axion-dpl-${jobId}`;

  caddyRemoveRoute(jobId).catch(() => {});

  try {
    execSync(`docker stop ${containerName} --time=10`, { stdio: "ignore" });
    execSync(`docker rm ${containerName}`, { stdio: "ignore" });
  } catch {}

  removeJob(jobId);
  sendStatus(jobId, "DELETED", config);
}

function stopAllContainers() {
  try {
    const ids = execSync('docker ps -q --filter "label=axion.job=true"', {
      encoding: "utf-8",
    }).trim();
    if (ids) {
      execSync(`docker stop ${ids.split("\n").join(" ")} --time=10`, {
        stdio: "ignore",
      });
      execSync(`docker rm ${ids.split("\n").join(" ")}`, { stdio: "ignore" });
    }
  } catch {}
  const state = readState();
  for (const jobId of Object.keys(state.jobs)) {
    caddyRemoveRoute(jobId).catch(() => {});
  }
  writeState({ hostId: state.hostId, tunnelId: state.tunnelId, jobs: {} });
}

// ── WebSocket ───────────────────────────────────────────────────────────

function sendStatus(jobId: string, status: string, config: AgentConfig) {
  if (activeWs?.readyState === WebSocket.OPEN) {
    activeWs.send(
      JSON.stringify({ type: "status", jobId, status, token: config.token }),
    );
  }
}

function handleMessage(msg: any) {
  if (!currentConfig) return;
  switch (msg.type) {
    case "subscribed":
      console.log("  [ws] Subscribed. Waiting for jobs...");
      break;
    case "start-job":
      startJob(msg, currentConfig);
      break;
    case "end-job":
      endJob(msg, currentConfig);
      break;
    case "error":
      console.error(`  [ws] Server error: ${msg.message}`);
      break;
  }
}

// ── Main ────────────────────────────────────────────────────────────────

export async function start() {
  checkLock();

  try {
    execSync("docker info", { stdio: "ignore" });
  } catch {
    console.error("  Error: Docker is not running.");
    process.exit(1);
  }

  const config = loadConfig();
  currentConfig = config;

  // Start cloudflared tunnel (persistent, no reload needed)
  if (checkCloudflared()) {
    startTunnel();
  } else {
    console.warn("  Warning: cloudflared not found. Tunnel not started.");
  }

  // Reconcile Caddy routes from state file (on restart/crash recovery)
  console.log("  Reconciling Caddy routes...");
  const state = readState();
  for (const job of Object.values(state.jobs)) {
    if (job.status === "RUNNING") {
      try {
        await caddyAddRoute(job.jobId, job.domain, job.containerName, job.port);
        console.log(
          `  Restored route: ${job.domain} \u2192 ${job.containerName}:${job.port}`,
        );
      } catch {
        // route may already exist
      }
    }
  }

  console.log(`\n  Axion Host Agent`);
  console.log(`  Host ID: ${config.host_id}\n`);

  let reconnectAttempt = 0;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let shouldRun = true;

  const shutdown = () => {
    shouldRun = false;
    console.log("\n  Shutting down...");
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (activeWs?.readyState === WebSocket.OPEN) {
      activeWs.send(
        JSON.stringify({ type: "UNSUBSCRIBE", token: config.token }),
      );
      activeWs.close();
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  function connect() {
    const ws = new WebSocket(WS_ENDPOINT);
    activeWs = ws;

    ws.addEventListener("open", () => {
      reconnectAttempt = 0;
      console.log("  [ws] Connected");
      ws.send(JSON.stringify({ type: "SUBSCRIBE", token: config.token }));

      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ type: "heartbeat", machineId: config.host_id }),
          );
        }
      }, HEARTBEAT_INTERVAL_MS);
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        handleMessage(msg);
      } catch {}
    });

    ws.addEventListener("close", () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (!shouldRun) return;
      const delay = Math.min(
        1000 * 2 ** reconnectAttempt,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttempt++;
      console.log(`  [ws] Reconnecting in ${delay / 1000}s...`);
      setTimeout(connect, delay);
    });

    ws.addEventListener("error", (event) => {
      console.error(
        "  [ws] Error:",
        (event as ErrorEvent).message || "connection failed",
      );
    });
  }

  connect();
}
