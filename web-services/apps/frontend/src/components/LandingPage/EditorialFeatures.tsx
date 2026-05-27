import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";

/* ─── Deploy log card ─────────────────────────────────────────────── */
const LOG_STEPS = [
  { text: "Requesting node allocation...", done: false },
  { text: "Provisioning 4 vCPU cores...", done: false },
  { text: "Attaching 50 GB NVMe SSD...", done: false },
  { text: "Locking SOL escrow onchain...", done: false },
  { text: "VM live — SSH ready  ✓", done: true },
];

function DeployCard() {
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 2, 100);
        setRevealed(Math.floor((next / 100) * LOG_STEPS.length));
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.15] bg-zinc-950/90 p-5">
      {/* Scanline overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
        }}
      />

      {/* Terminal header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[10px] font-mono text-zinc-500">
            vm-provision.log
          </span>
        </div>
        {/* Pulse pill */}
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span className="relative flex w-1.5 h-1.5">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </span>
          PROVISIONING LIVE
        </span>
      </div>

      {/* Log lines */}
      <div className="font-mono text-xs space-y-2 mb-4">
        {LOG_STEPS.map((s, i) => (
          <motion.div
            key={s.text}
            initial={{ opacity: 0, x: -8 }}
            animate={
              i < revealed ? { opacity: 1, x: 0 } : { opacity: 0.15, x: 0 }
            }
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                i < revealed
                  ? s.done
                    ? "bg-emerald-500"
                    : "bg-zinc-500"
                  : "bg-zinc-700"
              }`}
            />
            <span
              className={
                s.done && i < revealed ? "text-emerald-400" : "text-zinc-400"
              }
            >
              {s.text}
              {!s.done && i === revealed - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  ...
                </motion.span>
              )}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 rounded-full bg-white/[0.08] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-emerald-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

/* ─── Transaction stream card ─────────────────────────────────────── */
const TX_ROWS = [
  {
    from: "Wallet",
    to: "Escrow",
    amount: "0.42 SOL locked",
    status: "confirmed",
  },
  {
    from: "Escrow",
    to: "Provider",
    amount: "0.07 SOL released",
    status: "pending",
  },
  {
    from: "Escrow",
    to: "Wallet",
    amount: "0.35 SOL remaining",
    status: "queued",
  },
];

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="4" width="14" height="10" rx="2" />
      <path d="M1 7h14" />
      <circle cx="11.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="7" width="10" height="8" rx="2" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

function TxIcon({ entity }: { entity: string }) {
  if (entity === "Wallet") return <WalletIcon />;
  if (entity === "Escrow") return <LockIcon />;
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <path d="M6 3v10M10 3v10" />
    </svg>
  );
}

function TransactionCard() {
  return (
    <div className="rounded-xl border border-white/[0.15] bg-zinc-950/80 p-5 space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-zinc-400">
          Live transaction stream
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#9945FF]/15 text-[#9945FF]">
          <motion.span
            className="w-1 h-1 rounded-full bg-[#9945FF]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          Streaming
        </span>
      </div>

      {TX_ROWS.map((tx, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
          className="flex items-center gap-3 text-xs font-mono py-2.5 px-2 rounded-lg"
          style={{
            background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
          }}
        >
          {/* From icon + pill */}
          <span className="text-zinc-500 flex items-center gap-1.5">
            <TxIcon entity={tx.from} />
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
              {tx.from}
            </span>
          </span>

          {/* Animated connector */}
          <div className="flex-1 h-px bg-gradient-to-r from-[#9945FF]/30 to-emerald-500/30 relative">
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[#9945FF]"
              style={{
                width: 7,
                height: 7,
                boxShadow: "0 0 8px rgba(153,69,255,0.8)",
              }}
              animate={{ left: ["0%", "100%"] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.7,
                ease: "linear",
              }}
            />
          </div>

          {/* To icon + pill */}
          <span className="text-zinc-500 flex items-center gap-1.5">
            <TxIcon entity={tx.to} />
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300">
              {tx.to}
            </span>
          </span>

          {/* Amount */}
          <span
            className={`ml-2 ${tx.status === "confirmed" ? "text-emerald-400" : tx.status === "pending" ? "text-[#9945FF]" : "text-zinc-500"}`}
          >
            {tx.amount}
          </span>
        </motion.div>
      ))}

      {/* YOU / PROVIDER endpoint labels */}
      <div className="flex justify-between text-[10px] font-mono text-zinc-600 pt-2 px-2">
        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">
          YOU
        </span>
        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">
          PROVIDER
        </span>
      </div>

      {/* Verified label */}
      <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-emerald-500/70 text-right">
        verified onchain ✓
      </div>
    </div>
  );
}

/* ─── Earnings area chart (Option A) ─────────────────────────────── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Today"];
const EARNINGS = [1.2, 1.55, 1.38, 1.82, 1.65, 2.1, 1.95, 2.4];
const AVG = EARNINGS.reduce((a, b) => a + b, 0) / EARNINGS.length;
const MAX_E = Math.max(...EARNINGS);

function EarningsChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 320,
    H = 100,
    PAD = 8;

  const pts = EARNINGS.map((v, i) => ({
    x: PAD + (i / (EARNINGS.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - 0) / (MAX_E * 1.1)) * (H - PAD * 2),
    v,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const avgY = H - PAD - ((AVG - 0) / (MAX_E * 1.1)) * (H - PAD * 2);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono text-zinc-400">
          7-day SOL earnings
        </span>
        <div className="text-right">
          <motion.span
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-lg font-mono font-medium text-emerald-400 block"
          >
            +12.4 SOL
          </motion.span>
          <span className="text-[10px] text-zinc-500 font-mono">
            (~$892 USD)
          </span>
          <span className="text-[10px] text-emerald-500 font-mono block">
            ↑ 18% vs last week
          </span>
        </div>
      </div>

      {/* SVG chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="earn-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00FFA3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={PAD}
              y1={PAD + t * (H - PAD * 2)}
              x2={W - PAD}
              y2={PAD + t * (H - PAD * 2)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Avg dashed line */}
          <line
            x1={PAD}
            y1={avgY}
            x2={W - PAD}
            y2={avgY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={W - PAD - 2}
            y={avgY - 3}
            fill="rgba(255,255,255,0.3)"
            fontSize="7"
            textAnchor="end"
            fontFamily="monospace"
          >
            avg
          </text>

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#earn-grad)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#00FFA3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Data points */}
          {pts.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={i === pts.length - 1 ? 5 : hovered === i ? 4 : 2.5}
                fill={i === pts.length - 1 ? "#fff" : "#00FFA3"}
                stroke={i === pts.length - 1 ? "#00FFA3" : "transparent"}
                strokeWidth="1.5"
                style={{
                  filter:
                    i === pts.length - 1
                      ? "drop-shadow(0 0 6px #00FFA3)"
                      : undefined,
                }}
              />
            </g>
          ))}

          {/* Hover tooltip */}
          {hovered !== null && (
            <g>
              <rect
                x={Math.min(pts[hovered].x - 28, W - 60)}
                y={pts[hovered].y - 26}
                width={56}
                height={18}
                rx={4}
                fill="rgba(0,0,0,0.85)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <text
                x={Math.min(pts[hovered].x, W - 32)}
                y={pts[hovered].y - 13}
                fill="#00FFA3"
                fontSize="8"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {DAYS[hovered]} +{EARNINGS[hovered].toFixed(2)} SOL
              </text>
            </g>
          )}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-1 px-1">
          {DAYS.map((d, i) => (
            <span
              key={d}
              className={i === DAYS.length - 1 ? "text-emerald-500" : ""}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-zinc-500 flex justify-between">
        <span>Est. monthly</span>
        <span className="text-zinc-400">
          ~53.7 SOL / month <span className="text-zinc-600">(~$3,868 USD)</span>
        </span>
      </div>
    </div>
  );
}

/* ─── Shared FeatureBlock ─────────────────────────────────────────── */
interface FeatureBlockProps {
  label: string;
  heading: string;
  body: string;
  visual: React.ReactNode;
  reverse?: boolean;
  accent?: "purple" | "rose" | "mint" | "none";
}

const ACCENT_BG: Record<NonNullable<FeatureBlockProps["accent"]>, string> = {
  purple:
    "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(153,69,255,0.10), transparent 70%)",
  rose: "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(251,113,133,0.09), transparent 70%)",
  mint: "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(20,184,166,0.10), transparent 70%)",
  none: "transparent",
};

function FeatureBlock({
  label,
  heading,
  body,
  visual,
  reverse,
  accent = "none",
}: FeatureBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      {accent !== "none" && (
        <div
          aria-hidden
          className="absolute inset-x-[-10%] inset-y-0 pointer-events-none -z-10"
          style={{ background: ACCENT_BG[accent], filter: "blur(20px)" }}
        />
      )}
      <div
        className={`grid md:grid-cols-2 gap-16 md:gap-24 items-center py-20 ${reverse ? "md:[direction:rtl]" : ""}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="[direction:ltr]"
        >
          {/* Section label with left accent bar */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-0.5 h-4 bg-[#9945FF] rounded-full" />
            <span className="text-[10px] tracking-[0.14em] text-[#9945FF] uppercase font-mono">
              {label}
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-zinc-950 dark:text-white leading-[1.05] mb-6 tracking-tight whitespace-pre-line">
            {heading}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed max-w-sm">
            {body}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="[direction:ltr] bg-zinc-950/80 dark:bg-zinc-950/90 border border-white/[0.10] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-12px_rgba(0,0,0,0.4)]"
        >
          {visual}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
export default function EditorialFeatures() {
  return (
    <section className="border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent px-6 max-w-6xl mx-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/15 to-transparent" />

      <FeatureBlock
        label="01 — DEPLOY  /  Instant Provisioning"
        heading={"Deploy in Seconds.\nNot Minutes."}
        body="Pick a region, choose your specs, connect your wallet. Your VM is live in under 30 seconds — no signups, no credit cards, no waiting."
        accent="purple"
        visual={<DeployCard />}
      />

      <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/15 to-transparent" />

      <FeatureBlock
        label="02 — PAY  /  Trustless Billing"
        heading={"Pay with\nSOL"}
        body="No invoices. No chargebacks. SOL flows from your wallet into escrow, then to the provider — one second at a time. Fully onchain, fully auditable."
        accent="rose"
        visual={<TransactionCard />}
        reverse
      />

      <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/15 to-transparent" />

      <FeatureBlock
        label="03 — EARN  /  Passive SOL Income"
        heading={"Turn Idle\nHardware\ninto Revenue"}
        body="Register your machine once. Every VM second served pays you in SOL — streamed directly to your wallet in real time. No middlemen. No monthly payouts. Just continuous income."
        accent="mint"
        visual={<EarningsChart />}
      />
    </section>
  );
}
