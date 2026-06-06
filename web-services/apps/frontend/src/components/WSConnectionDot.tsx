import { motion } from "motion/react";
import { useWSConnectionStatus } from "@/lib/useIndexerEvents";

const dotColors: Record<string, string> = {
  connected: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
  connecting: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
  disconnected: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
};

const labels: Record<string, string> = {
  connected: "Real-time events connected",
  connecting: "Real-time events connecting…",
  disconnected: "Real-time events disconnected",
};

export function WSConnectionDot() {
  const status = useWSConnectionStatus();

  return (
    <motion.div
      className="relative"
      title={labels[status]}
      aria-label={labels[status]}
    >
      <motion.span
        className={`block h-2 w-2 rounded-full ${dotColors[status]}`}
        animate={
          status === "connecting" ? { scale: [1, 1.3, 1] } : { scale: 1 }
        }
        transition={
          status === "connecting"
            ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      />
    </motion.div>
  );
}
