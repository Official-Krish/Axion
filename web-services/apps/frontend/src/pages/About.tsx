import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Link } from "react-router-dom";
import { BackgroundGlow } from "@/components/BackgroundGlow";

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const BELIEFS = [
  {
    n: "01",
    title: "Compute should be permissionless.",
    body: "No accounts, no KYC, no invoices. Just cryptographic proof of payment to spin up infrastructure.",
  },
  {
    n: "02",
    title: "Hardware should work for its owners.",
    body: "Millions of servers sit idle overnight. We give them a job. Host machines earn SOL every second they serve compute — no middlemen.",
  },
  {
    n: "03",
    title: "Transparency is the product.",
    body: "Every payment, every VM allocation, every penalty lives on-chain. The escrow contract is the source of truth — not a dashboard.",
  },
];

export default function About() {
  const beliefsRef = useRef<HTMLDivElement>(null);
  const beliefsInView = useInView(beliefsRef, { once: true, margin: "-80px" });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="min-h-screen bg-background">
        {/* hero — full-width editorial */}
        <section className="relative pt-40 pb-32 px-6 max-w-6xl mx-auto">
          <BackgroundGlow
            color="rgba(153,69,255,0.08)"
            size="50% 50%"
            position="30% 50%"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-12 relative"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              About Axion
            </span>
          </motion.div>

          <h1 className="relative text-[clamp(3rem,9vw,8rem)] font-light leading-[0.92] tracking-[-0.045em] text-zinc-950 dark:text-white">
            <Reveal delay={0.1}>We're building</Reveal>
            <Reveal delay={0.22}>cloud that belongs</Reveal>
            <Reveal delay={0.34}>
              <span className="text-zinc-400 dark:text-zinc-600">
                to the network.
              </span>
            </Reveal>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-16 max-w-xl ml-auto"
          >
            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-light leading-relaxed">
              Axion is a decentralized cloud platform on Solana. Compute buyers
              pay with SOL through on-chain escrow. Compute sellers register
              physical machines and earn per second of workload served.
            </p>
            <p className="text-zinc-500 dark:text-zinc-500 text-base font-light leading-relaxed mt-4">
              No central authority. No billing department. No trust required.
            </p>
          </motion.div>
        </section>

        {/* beliefs */}
        <section
          ref={beliefsRef}
          className="border-t border-black/[0.06] dark:border-white/[0.06] max-w-6xl mx-auto px-6"
        >
          {BELIEFS.map((b, i) => (
            <motion.div
              key={b.n}
              initial={{ opacity: 0, y: 24 }}
              animate={beliefsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="grid md:grid-cols-12 gap-8 py-16 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
            >
              <span className="md:col-span-1 text-xs font-mono text-zinc-400 dark:text-zinc-600 pt-1.5">
                {b.n}
              </span>
              <h2 className="md:col-span-6 text-3xl md:text-4xl font-light text-zinc-950 dark:text-white leading-tight tracking-tight">
                {b.title}
              </h2>
              <p className="md:col-span-5 text-zinc-600 dark:text-zinc-400 font-light leading-relaxed self-center">
                {b.body}
              </p>
            </motion.div>
          ))}
        </section>

        {/* footnote CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto px-6 py-24 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-zinc-300 dark:bg-zinc-800" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              Solana DePIN
            </span>
          </div>
          <Link
            to="/contact"
            className="text-sm text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Get in touch →
          </Link>
        </motion.section>
      </div>
    </motion.div>
  );
}
