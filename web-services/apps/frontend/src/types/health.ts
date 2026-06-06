export interface HealthCheckResponse {
  status: "ok" | "degraded" | "down";
  uptime: number;
  timestamp: string;
  version: string;
  services: {
    database: "connected" | "error";
    redis: "connected" | "error";
  };
}
