import { motion } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
export default function Billing() {
  const { publicKey } = useWallet();

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
                Billing
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  Transactions
                </motion.span>
              </span>
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-12 mb-12 pb-8 border-b border-black/[0.06] dark:border-white/[0.06]"
          >
            {[
              {
                label: "Total spent",
                value: "—",
                color: "text-zinc-900 dark:text-white",
              },
              { label: "Total earned", value: "—", color: "text-emerald-500" },
              {
                label: "Wallet",
                value: `${publicKey?.toBase58()?.slice(0, 4) ?? "…"}…${publicKey?.toBase58()?.slice(-4) ?? ""}`,
                color: "text-zinc-500 dark:text-zinc-400",
              },
            ].map((s) => (
              <div key={s.label}>
                <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
                  {s.label}
                </span>
                <span
                  className={`text-xl font-light font-mono tabular-nums ${s.color}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-black/[0.06] dark:border-white/[0.06]"
          >
            <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block py-3">
              Activity
            </span>
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">
                No transactions yet. Rent a VM or host a machine to get started.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
