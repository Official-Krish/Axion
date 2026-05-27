import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Link } from "react-router-dom";

interface UseCase {
  quote: string;
  context: string;
  name: string;
  identity: string;
  specs: string;
  initials: string;
  tint: string;
  ringColor: string;
}

const CASES: UseCase[] = [
  {
    quote:
      "I rent 8× A100s for two hours, train a model, and pay 1.4 SOL. No quotas, no provisioning calls.",
    context: "On training LLMs with SolNet",
    name: "Maya Chen",
    identity: "ML Researcher at Stanford",
    specs: "8× A100 GPUs  ·  96 vCPU  ·  768 GB RAM",
    initials: "MC",
    tint: "from-[#9945FF] to-indigo-500",
    ringColor: "rgba(153,69,255,0.35)",
  },
  {
    quote:
      "Backend stack runs on a DePIN host in Frankfurt. 60% cheaper than AWS, settled in SOL every hour.",
    context: "Frankfurt DePIN node  ·  Saved 60% vs AWS",
    name: "L. Weber",
    identity: "Backend Engineer",
    specs: "Frankfurt DePIN node  ·  Saved 60% vs AWS",
    initials: "LW",
    tint: "from-pink-500 to-rose-400",
    ringColor: "rgba(244,114,182,0.35)",
  },
  {
    quote:
      "Two idle workstations earn me roughly 0.7 SOL a day. Setup took less than ten minutes.",
    context: "Hosting idle hardware on SolNet",
    name: "Sara Okafor",
    identity: "DePIN Host · Lagos",
    specs: "Hosting · 24 vCPU · 128 GB",
    initials: "SO",
    tint: "from-emerald-500 to-teal-400",
    ringColor: "rgba(52,211,153,0.35)",
  },
];

export default function UseCases() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-2xl"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-0.5 h-4 bg-[#9945FF] rounded-full" />
            <span className="text-[10px] tracking-[0.14em] text-[#9945FF] uppercase font-mono">
              IN PRODUCTION / Real Workloads
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light text-zinc-950 dark:text-white leading-tight tracking-tight">
            Real engineers.{" "}
            <span className="text-zinc-400 dark:text-zinc-600">
              Real workloads. Real savings.
            </span>
          </h2>
        </motion.div>

        {/* Testimonials */}
        <div className="space-y-12 md:space-y-16">
          {CASES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.2 + i * 0.15,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className={`grid md:grid-cols-12 gap-6 md:gap-12 items-start ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
              >
                {/* Avatar */}
                <div className="md:col-span-2 [direction:ltr]">
                  <div
                    className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${c.tint} text-white font-medium flex items-center justify-center text-base`}
                    style={{
                      boxShadow: `0 0 0 2px ${c.ringColor}, 0 8px 24px -8px ${c.ringColor}`,
                    }}
                  >
                    {c.initials}
                  </div>
                </div>

                {/* Quote + attribution */}
                <div className="md:col-span-10 [direction:ltr]">
                  {/* Watermark quote mark */}
                  <div
                    className="text-[#9945FF] leading-none -mb-6 select-none font-serif"
                    style={{ fontSize: 120, opacity: 0.08 }}
                    aria-hidden
                  >
                    ❝
                  </div>

                  {/* Context label */}
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                    {c.context}
                  </div>

                  <blockquote
                    className={`font-light text-zinc-900 dark:text-white leading-[1.25] tracking-tight max-w-3xl mb-5 ${i === 0 ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl md:text-2xl lg:text-3xl"}`}
                  >
                    {c.quote}
                  </blockquote>

                  <div className="space-y-0.5 text-sm">
                    <div className="text-zinc-950 dark:text-white font-medium">
                      {c.name}{" "}
                      <span className="text-zinc-400 font-normal">—</span>{" "}
                      {c.identity}
                    </div>
                    <div className="font-mono text-zinc-500 text-xs">
                      {c.specs}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider between testimonials */}
              {i < CASES.length - 1 && (
                <div className="mt-12 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/[0.08] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA after testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 flex items-center gap-3 text-sm"
        >
          <span className="text-zinc-500 dark:text-zinc-500">
            Join 2,800+ nodes already on the network.
          </span>
          <Link
            to="/rent"
            className="group inline-flex items-center gap-1.5 text-[#9945FF] hover:text-[#C4B5FD] transition-colors font-medium"
          >
            Start Computing
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Bottom divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 1.0, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/10 to-transparent origin-center"
        />
      </div>
    </section>
  );
}
