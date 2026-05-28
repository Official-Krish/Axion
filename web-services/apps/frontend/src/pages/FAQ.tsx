import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

const FAQS = [
  {
    q: "What is Axion?",
    a: "A decentralized cloud computing platform. Rent VMs paying with SOL via on-chain escrow, or earn SOL by sharing compute through the DePIN network.",
  },
  {
    q: "How do payments work?",
    a: "Every VM rental locks SOL in an Anchor-program escrow account. Funds are metered per second and settled when the session ends — no credit card, no invoice.",
  },
  {
    q: "What is DePIN hosting?",
    a: "Register your physical machine on the network. When users deploy to your node, you earn SOL per second of compute served. Rewards accumulate on-chain and are claimable at any time.",
  },
  {
    q: "Which providers are available?",
    a: "AWS, GCP, and the decentralized DePIN node pool. DePIN currently runs Docker images only and costs ~55% less than managed cloud providers.",
  },
  {
    q: "Is my data secure?",
    a: "VM access is SSH key-only. Keys are ephemeral and never stored on our servers. All payments go through audited smart contracts — no payment data touches our backend.",
  },
  {
    q: "What happens when a session ends?",
    a: "The escrow settles proportionally. Unused SOL is returned to your wallet. The VM is terminated and all associated resources released within 60 seconds.",
  },
  {
    q: "Can I cancel a VM mid-session?",
    a: "Yes. Ending early triggers the escrow refund function — you pay only for the time consumed.",
  },
  {
    q: "Do I need an account?",
    a: "You sign in via wallet signature — no username or password. Your Solana public key is your identity on Axion.",
  },
];

function Item({ faq, i }: { faq: (typeof FAQS)[0]; i: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      className="border-b border-black/[0.05] dark:border-white/[0.05]"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-light text-zinc-900 dark:text-white group-hover:text-[#9945FF] transition-colors duration-300 pr-8">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-400 dark:text-zinc-600 flex-shrink-0 text-xl leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-2xl">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 50% 10%, rgba(153,69,255,0.06), transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              Frequently asked
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
                Questions.
              </motion.span>
            </span>
          </h1>
        </div>

        <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
          {FAQS.map((faq, i) => (
            <Item key={faq.q} faq={faq} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
