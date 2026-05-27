import { motion } from "motion/react";

export default function Pricing() {
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
              Pricing
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Simple, transparent pricing
            </motion.span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 max-w-lg leading-relaxed">
            Pay per second for compute. No minimums, no upfront commitments.
            Pricing details will be published as we approach mainnet launch.
          </p>
        </div>
        <div className="py-12 text-center border-t border-black/[0.06] dark:border-white/[0.06]">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Pricing tiers coming soon. Try the pricing calculator on the landing
            page for estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
