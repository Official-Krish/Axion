import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

interface Tx {
  id: number;
  from: string;
  to: string;
  amount: string;
  sig: string;
  ms: number;
  confirmed: boolean;
}

let counter = 0;
const AMOUNTS = ["0.42", "0.18", "1.02", "0.07", "0.65", "0.33"];
const ROUTES = [
  { from: "Wallet", to: "Escrow" },
  { from: "Escrow", to: "Provider" },
  { from: "Escrow", to: "Wallet" },
];

const STATS = [
  { label: "Avg settlement", value: "~400ms" },
  { label: "Per transaction", value: "<$0.0001" },
  { label: "Solana mainnet", value: "65,000 TPS" },
];

const NODES = [
  {
    label: "Your Wallet",
    sub: "Phantom, Backpack, or any Solana wallet",
    color: "#9945FF",
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="5" width="16" height="12" rx="2.5" />
        <path d="M2 9h16" />
        <circle cx="14" cy="13" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Smart Contract",
    sub: "Audited escrow — holds funds, releases per second",
    color: "#6366F1",
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="4" y="9" width="12" height="9" rx="2" />
        <path d="M7 9V7a3 3 0 016 0v2" />
        <circle cx="10" cy="14" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "VM Provider",
    sub: "AWS · GCP · bare-metal DePIN node",
    color: "#38BDF8",
    icon: (
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="4" width="16" height="12" rx="2" />
        <path d="M2 9h16M7 4v12M13 4v12" />
      </svg>
    ),
  },
];

export default function SOLPaymentFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [feed, setFeed] = useState<Tx[]>([]);
  const [pipe, setPipe] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
      const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
      const tx: Tx = {
        id: counter++,
        from: route.from,
        to: route.to,
        amount: `${amount} SOL`,
        sig: Math.random().toString(36).slice(2, 10).toUpperCase(),
        ms: 300 + Math.floor(Math.random() * 300),
        confirmed: false,
      };
      setFeed((p) => [tx, ...p].slice(0, 5));
      setPipe((p) => (p + 1) % 2);
      setTimeout(() => {
        setFeed((p) =>
          p.map((t) => (t.id === tx.id ? { ...t, confirmed: true } : t)),
        );
      }, tx.ms);
    }, 1800);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent py-28 px-6 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(153,69,255,0.07), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-0.5 h-4 bg-[#9945FF] rounded-full" />
            <span className="text-[10px] tracking-[0.14em] text-[#9945FF] uppercase font-mono">
              PAYMENT LAYER / Solana Native
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light text-zinc-950 dark:text-white leading-[1.05] tracking-tight">
            Pay per second.
            <br />
            <span className="text-zinc-400 dark:text-zinc-600">
              Settled onchain. Every second.
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT — flow diagram */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {NODES.map((node, i) => (
                <div key={node.label} className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-5 py-4"
                  >
                    {/* Icon + connector column */}
                    <div className="flex flex-col items-center flex-shrink-0 w-10">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: node.color + "18",
                          color: node.color,
                          boxShadow: `0 0 0 1px ${node.color}30`,
                        }}
                      >
                        {node.icon}
                      </div>
                      {i < 2 && (
                        <div
                          className="relative w-px mt-1"
                          style={{ height: 36 }}
                        >
                          <div className="absolute inset-0 bg-zinc-200 dark:bg-white/10" />
                          {/* Animated traveling dot */}
                          <motion.div
                            className="absolute left-1/2 -translate-x-1/2 rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: node.color,
                              boxShadow: `0 0 8px ${node.color}`,
                              top: 0,
                            }}
                            animate={inView ? { top: [0, 30, 0] } : {}}
                            transition={{
                              duration: 1.6,
                              delay: pipe === i ? 0 : 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Node card with left border accent */}
                    <div
                      className="flex-1 pl-3 border-l-2 rounded-sm"
                      style={{ borderColor: node.color + "50" }}
                    >
                      <div className="text-zinc-950 dark:text-white text-sm font-medium leading-none mb-1">
                        {node.label}
                      </div>
                      <div className="text-zinc-500 dark:text-zinc-500 text-xs">
                        {node.sub}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
              {STATS.map(({ label, value }) => (
                <div key={label} className="pl-3 border-l border-[#9945FF]/30">
                  <div className="text-zinc-950 dark:text-white text-base font-light font-mono tabular-nums">
                    {value}
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vertical divider */}
          <div className="hidden lg:block absolute left-1/2 top-[200px] bottom-[80px] w-px bg-white/[0.06]" />

          {/* RIGHT — live tx feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono uppercase tracking-widest">
                Live transactions
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Solana devnet
              </span>
            </div>

            <div className="relative rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                <span>Route</span>
                <span>Amount</span>
                <span>Settled In</span>
              </div>

              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] min-h-[280px]">
                <AnimatePresence initial={false}>
                  {feed.map((tx, rowIdx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-4 py-3 font-mono text-xs"
                      style={{
                        background:
                          rowIdx % 2 === 0
                            ? "rgba(255,255,255,0.03)"
                            : "transparent",
                      }}
                    >
                      <span className="text-zinc-700 dark:text-zinc-400 truncate flex items-center gap-1">
                        {/* Colored dot: green=confirmed, gray=pending */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tx.confirmed ? "bg-emerald-500" : "bg-zinc-500"}`}
                        />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {tx.from}
                        </span>
                        <span className="text-[#9945FF]/60 mx-0.5">→</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {tx.to}
                        </span>
                      </span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {tx.amount}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-500">
                        {tx.ms}ms
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Pending pill for last faded row */}
                {feed.length > 0 && !feed[feed.length - 1].confirmed && (
                  <div className="px-4 py-2 opacity-50">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400">
                      Pending
                    </span>
                  </div>
                )}

                {feed.length === 0 && (
                  <div className="flex items-center justify-center h-[280px] text-zinc-400 dark:text-zinc-600 text-[11px] font-mono">
                    Waiting for transactions…
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-600 leading-relaxed">
              Every second of compute triggers an onchain release. No invoices,
              no manual settlement, no trust required.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
