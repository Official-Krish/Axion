import { motion } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";

export default function Roadmap() {
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
                Roadmap
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                What's next
              </motion.span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 max-w-lg leading-relaxed">
              We're working on expanding the network, adding new regions, and
              improving the developer experience. The roadmap will be published
              here as milestones are defined.
            </p>
          </div>
          <div className="py-12 text-center border-t border-black/[0.06] dark:border-white/[0.06]">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">
              Roadmap details coming soon.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
