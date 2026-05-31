import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { spawn, type ChildProcess } from "child_process";

const TOKEN_FILE = join(homedir(), ".axion", "tunnel-token.txt");

let tunnelProcess: ChildProcess | null = null;

export function saveTunnelToken(token: string): void {
  mkdirSync(join(homedir(), ".axion"), { recursive: true });
  writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
}

export function startTunnel(): void {
  if (tunnelProcess) return;

  const token = readToken();
  if (!token) {
    console.error("  No tunnel token found. Run 'axion register' again.");
    return;
  }

  tunnelProcess = spawn(
    "cloudflared",
    ["tunnel", "run", "--token", token, "--url", "http://localhost:80"],
    { stdio: "inherit", detached: true },
  );
  tunnelProcess.unref();

  tunnelProcess.on("exit", (code) => {
    if (code !== 0) console.error(`  cloudflared exited with code ${code}`);
    tunnelProcess = null;
  });
}

function readToken(): string | null {
  try {
    if (existsSync(TOKEN_FILE)) {
      return readFileSync(TOKEN_FILE, "utf-8").trim() || null;
    }
  } catch {}
  return null;
}

export function stopTunnel(): void {
  if (tunnelProcess) {
    tunnelProcess.kill("SIGTERM");
    tunnelProcess = null;
  }
}

export function checkCloudflared(): boolean {
  try {
    const { execSync } = require("child_process");
    execSync("cloudflared version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
