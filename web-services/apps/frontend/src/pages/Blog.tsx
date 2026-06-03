import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { TUTORIALS, TAG_COLOR } from "@/data/tutorials";

export default function Blog() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="min-h-screen bg-background pt-28 pb-40 px-6">
        <BackgroundGlow
          color="rgba(153,69,255,0.05)"
          size="40% 30%"
          position="40% 0%"
        />
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="h-px w-6 bg-[#9945FF]/60" />
              <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
                Blog
              </span>
              <span className="ml-auto text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
                {TUTORIALS.length} guides
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                Updates & insights
              </motion.span>
            </h1>
          </div>

          <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
            {TUTORIALS.map((t, i) => (
              <motion.div
                key={t.n}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <Link
                  to={`/tutorials/${t.slug}`}
                  className="grid md:grid-cols-12 gap-4 py-8 border-b border-black/[0.05] dark:border-white/[0.05] group"
                >
                  <div className="md:col-span-1">
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                      {t.n}
                    </span>
                  </div>
                  <div className="md:col-span-7">
                    <h3 className="text-xl font-light text-zinc-950 dark:text-white group-hover:text-[#9945FF] transition-colors duration-300 mb-2">
                      {t.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 font-light leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <div className="md:col-span-4 flex md:justify-end items-start gap-4 pt-0.5">
                    <span
                      className={`text-[10px] tracking-[0.18em] uppercase ${TAG_COLOR[t.tag]}`}
                    >
                      {t.tag}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                      {t.time}
                    </span>
                    <span className="text-zinc-400 group-hover:text-[#9945FF] group-hover:translate-x-1 transition-all duration-300 text-sm">
                      →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
