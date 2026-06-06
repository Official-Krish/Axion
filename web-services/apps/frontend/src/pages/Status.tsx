import { motion } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { useHealth } from "@/hooks/useHealth";
import { useWSConnectionStatus } from "@/lib/useIndexerEvents";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ServiceStatus = "ok" | "degraded" | "down" | "connecting";

const serviceMeta: Record<string, { label: string; desc: string }> = {
  api: { label: "API", desc: "Backend REST API" },
  database: { label: "Database", desc: "PostgreSQL via Prisma" },
  redis: { label: "Redis", desc: "Job queue & cache" },
  websocket: { label: "WebSocket", desc: "Real-time event relay" },
  worker: { label: "Worker", desc: "Background job processor" },
};

function statusDot(status: ServiceStatus) {
  const colors: Record<string, string> = {
    ok: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    degraded: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    down: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    connecting: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]",
  };
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${colors[status]}`} />
  );
}

export default function Status() {
  const health = useHealth();
  const wsStatus = useWSConnectionStatus();

  const overall: ServiceStatus = (() => {
    if (health.error && wsStatus === "disconnected") return "down";
    if (health.data?.status === "degraded" || wsStatus === "disconnected")
      return "degraded";
    if (wsStatus === "connecting" || (!health.data && !health.error))
      return "connecting";
    return "ok";
  })();

  const services: { id: string; status: ServiceStatus }[] = [
    {
      id: "api",
      status: health.error
        ? "down"
        : !health.data
          ? "connecting"
          : health.data.status,
    },
    {
      id: "database",
      status: health.error
        ? "down"
        : !health.data
          ? "connecting"
          : health.data.services.database === "connected"
            ? "ok"
            : "down",
    },
    {
      id: "redis",
      status: health.error
        ? "down"
        : !health.data
          ? "connecting"
          : health.data.services.redis === "connected"
            ? "ok"
            : "down",
    },
    {
      id: "websocket",
      status:
        wsStatus === "connected"
          ? "ok"
          : wsStatus === "connecting"
            ? "connecting"
            : "down",
    },
    {
      id: "worker",
      status: health.error ? "down" : !health.data ? "connecting" : "ok",
    },
  ];

  const overallLabel: Record<ServiceStatus, string> = {
    ok: "All systems operational",
    degraded: "Some systems degraded",
    down: "Systems unavailable",
    connecting: "Checking systems…",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="min-h-screen bg-background pt-28 pb-40 px-6">
        <BackgroundGlow
          color="rgba(153,69,255,0.05)"
          size="40% 30%"
          position="40% 0%"
        />
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="h-px w-6 bg-[#9945FF]/60" />
              <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
                Status
              </span>
            </motion.div>

            <div className="flex items-center gap-3 mb-4">
              {overall === "ok" ? (
                <span className="relative w-3 h-3">
                  <span className="absolute inset-0 rounded-full bg-emerald-500" />
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
                </span>
              ) : overall === "connecting" ? (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              ) : (
                <AlertCircle
                  className={`h-5 w-5 ${overall === "degraded" ? "text-amber-500" : "text-red-500"}`}
                />
              )}
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
                {overallLabel[overall]}
              </h1>
            </div>

            {health.latency !== null && overall !== "down" && (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Response time: {health.latency}ms
              </p>
            )}
          </div>

          <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between py-5 border-b border-black/[0.05] dark:border-white/[0.05]"
              >
                <div className="flex items-center gap-4">
                  {statusDot(svc.status)}
                  <div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-white">
                      {serviceMeta[svc.id].label}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                      {serviceMeta[svc.id].desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {svc.status === "ok" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : svc.status === "connecting" ? (
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  ) : (
                    <AlertCircle
                      className={`h-4 w-4 ${svc.status === "degraded" ? "text-amber-500" : "text-red-500"}`}
                    />
                  )}
                  <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600 uppercase">
                    {svc.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {health.data && (
            <p className="mt-8 text-[11px] font-mono text-zinc-400 dark:text-zinc-600 text-center">
              Last checked:{" "}
              {new Date(health.data.timestamp).toLocaleTimeString()}
              {" · "}Uptime: {Math.floor(health.data.uptime / 60)}m{" · "}v
              {health.data.version}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
