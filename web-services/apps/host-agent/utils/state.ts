import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const STATE_FILE = join(homedir(), ".axion", "state.json");

export interface JobState {
  jobId: string;
  containerName: string;
  domain: string;
  port: number;
  status: "CREATING" | "BOOTING" | "RUNNING" | "DELETED";
}

export interface AgentState {
  hostId: string;
  tunnelId: string;
  jobs: Record<string, JobState>;
}

export function readState(): AgentState {
  try {
    if (!existsSync(STATE_FILE)) return { hostId: "", tunnelId: "", jobs: {} };
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { hostId: "", tunnelId: "", jobs: {} };
  }
}

export function writeState(state: AgentState): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
}

export function addJob(job: JobState): void {
  const state = readState();
  state.jobs[job.jobId] = job;
  writeState(state);
}

export function removeJob(jobId: string): void {
  const state = readState();
  delete state.jobs[jobId];
  writeState(state);
}

export { STATE_FILE };
