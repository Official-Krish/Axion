import { motion } from "motion/react";

export default function Status() {
  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 40% 0%, rgba(153,69,255,0.05), transparent 70%)",
        }}
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
            <span className="relative w-3 h-3">
              <span className="absolute inset-0 rounded-full bg-[#14F195]" />
              <span className="absolute inset-0 rounded-full bg-[#14F195] animate-ping opacity-60" />
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
              All systems operational
            </h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Real-time service status will appear here as the network grows.
          </p>
        </div>
      </div>
    </div>
  );
}
