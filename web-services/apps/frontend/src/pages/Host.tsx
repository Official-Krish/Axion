import { motion } from "motion/react";
import { Link } from "react-router-dom";

const OPTIONS = [
  {
    href: "/hosting",
    label: "01",
    title: "How it works",
    desc: "See how to join the DePIN network and start earning SOL from idle hardware.",
    cta: "Learn more",
    accent: "rgba(153,69,255,0.10)",
  },
  {
    href: "/depin/register",
    label: "02",
    title: "Register your machine",
    desc: "Turn idle hardware into SOL revenue. Register specs, run verification script, go live.",
    cta: "Register",
    accent: "rgba(16,185,129,0.08)",
  },
  {
    href: "/depin/host/dashboard",
    label: "03",
    title: "Host dashboard",
    desc: "Monitor earnings, manage nodes, and track uptime across your registered machines.",
    cta: "Open dashboard",
    accent: "rgba(56,189,248,0.08)",
  },
];

export default function Host() {
  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 20%, rgba(153,69,255,0.07), transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              DePIN Hosting
            </span>
          </motion.div>

          <h1 className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.04em] text-zinc-950 dark:text-white">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                Earn with
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block text-zinc-400 dark:text-zinc-600"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.85,
                  delay: 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                your hardware.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-8 text-zinc-500 dark:text-zinc-400 text-lg font-light max-w-md"
          >
            Register idle machines on the Axion DePIN network. Earn SOL every
            second your compute is consumed.
          </motion.p>
        </div>

        {/* options — horizontal editorial columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-black/[0.06] dark:divide-white/[0.06] border-t border-black/[0.06] dark:border-white/[0.06]">
          {OPTIONS.map((opt, i) => (
            <motion.div
              key={opt.href}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.3 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative px-0 md:px-8 py-12 first:pl-0 last:pr-0"
            >
              {/* ambient hover glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${opt.accent}, transparent 70%)`,
                }}
              />

              <div className="relative">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 block mb-6">
                  {opt.label}
                </span>
                <h2 className="text-2xl font-light text-zinc-950 dark:text-white leading-tight tracking-tight mb-4">
                  {opt.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-light leading-relaxed mb-8">
                  {opt.desc}
                </p>
                <Link
                  to={opt.href}
                  className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors duration-200 group/link"
                >
                  {opt.cta}
                  <span className="group-hover/link:translate-x-0.5 transition-transform duration-200 inline-block">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
