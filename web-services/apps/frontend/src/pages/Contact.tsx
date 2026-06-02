import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";

export default function Contact() {
  const [focused, setFocused] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [vals, setVals] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputCls = (field: string) =>
    `w-full bg-transparent border-0 border-b text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors duration-300 ${
      focused === field
        ? "border-zinc-900 dark:border-white"
        : "border-black/10 dark:border-white/10"
    } ${errors[field] ? "animate-shake" : ""}`;

  return (
    <div className="min-h-screen bg-background pt-28 pb-40 px-6">
      <BackgroundGlow
        color="rgba(153,69,255,0.07)"
        size="50% 40%"
        position="80% 30%"
      />

      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              Contact
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
                Let's talk.
              </motion.span>
            </span>
          </h1>
        </div>

        <div className="grid md:grid-cols-12 gap-16 md:gap-24">
          {/* left — channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="md:col-span-4 space-y-0 divide-y divide-black/[0.05] dark:divide-white/[0.05]"
          >
            {[
              {
                label: "Email",
                value: "Krishanand974@gmail.com",
                href: "mailto:Krishanand974@gmail.com",
              },
              {
                label: "GitHub",
                value: "Official-Krish",
                href: "https://github.com/Official-Krish",
              },
              {
                label: "Twitter / X",
                value: "@KrishAnand0103",
                href: "https://x.com/KrishAnand0103",
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 py-5 group"
              >
                <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 group-hover:text-[#9945FF] transition-colors duration-300">
                  {c.label}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-300">
                  {c.value}
                </span>
              </a>
            ))}
          </motion.div>

          {/* right — form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="md:col-span-8"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16"
                >
                  <p className="text-2xl font-light text-zinc-950 dark:text-white mb-2">
                    Message sent.
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-500 text-sm">
                    We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  role="form"
                  aria-label="Contact form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newErrors: Record<string, string> = {};
                    if (!vals.name) newErrors.name = "Name is required";
                    if (!vals.email) newErrors.email = "Email is required";
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email))
                      newErrors.email = "Invalid email";
                    if (!vals.message)
                      newErrors.message = "Message is required";
                    setErrors(newErrors);
                    if (Object.keys(newErrors).length > 0) return;
                    setSent(true);
                  }}
                  className="space-y-8"
                >
                  <input
                    className={inputCls("name")}
                    placeholder="Your name"
                    value={vals.name}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) =>
                      setVals((v) => ({ ...v, name: e.target.value }))
                    }
                    required
                  />
                  <input
                    type="email"
                    className={inputCls("email")}
                    placeholder="Email address"
                    value={vals.email}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) =>
                      setVals((v) => ({ ...v, email: e.target.value }))
                    }
                    required
                  />
                  <textarea
                    className={inputCls("message") + " resize-none"}
                    placeholder="What's on your mind?"
                    rows={5}
                    value={vals.message}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) =>
                      setVals((v) => ({ ...v, message: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="submit"
                    className="group inline-flex items-center gap-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-7 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-white/90 transition-all duration-300"
                  >
                    Send message
                    <span className="group-hover:translate-x-0.5 transition-transform inline-block">
                      →
                    </span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
