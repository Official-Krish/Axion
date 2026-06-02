import { motion } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";

export default function Notifications() {
  return (
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
              Notifications
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Alerts
            </motion.span>
          </h1>
        </div>
        <div className="py-12 text-center border-t border-black/[0.06] dark:border-white/[0.06]">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No notifications yet. Activity from your VMs and host machines will
            appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
