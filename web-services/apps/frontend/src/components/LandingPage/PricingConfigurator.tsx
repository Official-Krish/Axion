import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Slider } from "@/components/ui/slider";

const SOL_PRICE = 150;
const formatSOL = (usd: number) => (usd / SOL_PRICE).toFixed(4);

const PROVIDERS = ["AWS", "GCP", "DePIN"] as const;
type Provider = (typeof PROVIDERS)[number];

const PRICE_MULTIPLIERS: Record<Provider, number> = {
  AWS: 1.0,
  GCP: 0.95,
  DePIN: 0.45,
};
const BASE_PRICE = { cpu: 0.048, ram: 0.006, storage: 0.0001 };

const CPU_CHIPS = [2, 4, 8, 16, 32];
const RAM_CHIPS = [4, 8, 16, 32, 64];
const STORAGE_CHIPS = [50, 100, 500, 1000];
const HOURS_CHIPS = [1, 24, 168, 720];
const HOURS_LABELS: Record<number, string> = {
  1: "1 hr",
  24: "24 hrs",
  168: "7 days",
  720: "30 days",
};

function ChipRow({
  chips,
  value,
  set,
  format,
}: {
  chips: number[];
  value: number;
  set: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c) => (
        <button
          key={c}
          onClick={() => set(c)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all duration-150 ${
            value === c
              ? "bg-[#9945FF]/15 border-[#9945FF]/50 text-[#9945FF]"
              : "border-white/[0.10] text-zinc-500 hover:text-zinc-300 hover:border-white/20"
          }`}
        >
          {format ? format(c) : c}
        </button>
      ))}
    </div>
  );
}

export default function PricingConfigurator() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [cpu, setCpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [storage, setStorage] = useState(50);
  const [hours, setHours] = useState(24);
  const [provider, setProvider] = useState<Provider>("AWS");

  const hourlyUSD =
    (BASE_PRICE.cpu * cpu +
      BASE_PRICE.ram * ram +
      BASE_PRICE.storage * storage) *
    PRICE_MULTIPLIERS[provider];
  const totalUSD = hourlyUSD * hours;
  const totalSOL = parseFloat(formatSOL(totalUSD));
  const hourlySOL = parseFloat(formatSOL(hourlyUSD));
  const awsUSD =
    (BASE_PRICE.cpu * cpu +
      BASE_PRICE.ram * ram +
      BASE_PRICE.storage * storage) *
    hours;
  const savePct = Math.round((1 - PRICE_MULTIPLIERS[provider]) * 100);
  const perSecSOL = hourlySOL / 3600;

  const resetDefaults = () => {
    setCpu(4);
    setRam(8);
    setStorage(50);
    setHours(24);
    setProvider("AWS");
  };

  return (
    <section
      ref={ref}
      className="relative border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent py-32 px-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 50%, rgba(56,189,248,0.08), transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-0.5 h-4 bg-[#9945FF] rounded-full" />
            <span className="text-[10px] tracking-[0.14em] text-[#9945FF] uppercase font-mono">
              PRICING / No surprises
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light text-zinc-950 dark:text-white leading-tight">
            Price your stack.
            <br />
            <span className="text-zinc-400 dark:text-zinc-600">Instantly.</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-4 max-w-md">
            Adjust specs. Watch the price update live in SOL and USD. Billed per
            second, cancel anytime.
          </p>
        </motion.div>

        {/* Separator */}
        <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] mb-12" />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* LEFT — controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="space-y-8"
          >
            {/* Segmented pill toggle */}
            <div>
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-3 font-mono">
                Provider
              </div>
              <div className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.03] p-0.5">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      provider === p
                        ? "bg-[#9945FF] text-white shadow-[0_0_12px_rgba(153,69,255,0.4)]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {p === "DePIN" && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 whitespace-nowrap">
                        -55%
                      </span>
                    )}
                    {p}
                  </button>
                ))}
              </div>
              {provider === "DePIN" && (
                <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                  DePIN nodes are community-hosted bare-metal — deepest
                  discounts, same SLA
                </p>
              )}
            </div>

            {/* vCPU */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-700 dark:text-zinc-300 text-sm">
                  vCPU
                </span>
                <span className="text-zinc-950 dark:text-white font-mono text-sm">
                  {cpu}{" "}
                  <span className="text-zinc-400 dark:text-zinc-600">
                    cores
                  </span>
                </span>
              </div>
              <Slider
                min={1}
                max={32}
                step={1}
                value={[cpu]}
                onValueChange={([v]) => setCpu(v)}
                className="[&_[role=slider]]:w-[18px] [&_[role=slider]]:h-[18px] [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#9945FF] [&_.range]:bg-[#9945FF]"
              />
              <ChipRow chips={CPU_CHIPS} value={cpu} set={setCpu} />
            </div>

            {/* RAM */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-700 dark:text-zinc-300 text-sm">
                  RAM
                </span>
                <span className="text-zinc-950 dark:text-white font-mono text-sm">
                  {ram}{" "}
                  <span className="text-zinc-400 dark:text-zinc-600">GB</span>
                </span>
              </div>
              <Slider
                min={1}
                max={128}
                step={1}
                value={[ram]}
                onValueChange={([v]) => setRam(v)}
                className="[&_[role=slider]]:w-[18px] [&_[role=slider]]:h-[18px] [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#9945FF] [&_.range]:bg-[#9945FF]"
              />
              <ChipRow
                chips={RAM_CHIPS}
                value={ram}
                set={setRam}
                format={(v) => `${v} GB`}
              />
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-700 dark:text-zinc-300 text-sm">
                  SSD Storage
                </span>
                <span className="text-zinc-950 dark:text-white font-mono text-sm">
                  {storage}{" "}
                  <span className="text-zinc-400 dark:text-zinc-600">GB</span>
                </span>
              </div>
              <Slider
                min={10}
                max={2000}
                step={10}
                value={[storage]}
                onValueChange={([v]) => setStorage(v)}
                className="[&_[role=slider]]:w-[18px] [&_[role=slider]]:h-[18px] [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#9945FF] [&_.range]:bg-[#9945FF]"
              />
              <ChipRow
                chips={STORAGE_CHIPS}
                value={storage}
                set={setStorage}
                format={(v) => (v >= 1000 ? `${v / 1000} TB` : `${v} GB`)}
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-700 dark:text-zinc-300 text-sm">
                  Run duration
                </span>
                <span className="text-zinc-950 dark:text-white font-mono text-sm">
                  {hours} hrs{" "}
                  {hours >= 24 ? (
                    <span className="text-zinc-400 dark:text-zinc-600 text-xs">
                      (~{Math.round(hours / 24)} day{hours >= 48 ? "s" : ""})
                    </span>
                  ) : null}
                </span>
              </div>
              <Slider
                min={1}
                max={720}
                step={1}
                value={[hours]}
                onValueChange={([v]) => setHours(v)}
                className="[&_[role=slider]]:w-[18px] [&_[role=slider]]:h-[18px] [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#9945FF] [&_.range]:bg-[#9945FF]"
              />
              <ChipRow
                chips={HOURS_CHIPS}
                value={hours}
                set={setHours}
                format={(v) => HOURS_LABELS[v] ?? `${v} hrs`}
              />
            </div>

            {/* Reset */}
            <button
              onClick={resetDefaults}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono underline underline-offset-2 transition-colors"
            >
              Reset to defaults
            </button>
          </motion.div>

          {/* RIGHT — cost panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="sticky top-24"
          >
            <div className="rounded-2xl border border-white/[0.18] bg-zinc-950/80 backdrop-blur-md p-7 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_20px_40px_-20px_rgba(153,69,255,0.15)]">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 mb-6 text-[10px] font-mono text-zinc-500">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
                Updating live
              </div>

              {/* Hero price */}
              <motion.div
                key={totalSOL}
                initial={{ opacity: 0.6, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-6xl font-light text-white tabular-nums">
                    {totalSOL.toFixed(3)}
                  </span>
                  <span className="text-2xl text-[#9945FF] mb-1.5">
                    SOL / hr
                  </span>
                </div>
                <div className="text-zinc-500 text-sm mb-2">
                  ${totalUSD.toFixed(2)} USD · {hours}h total
                </div>
                {savePct > 0 && (
                  <div className="text-emerald-400 text-xs font-mono">
                    vs AWS on-demand: ${awsUSD.toFixed(2)} → you save {savePct}%
                  </div>
                )}
              </motion.div>

              <div className="h-px bg-white/[0.08] my-6" />

              {/* Breakdown */}
              <div className="space-y-3 mb-4">
                {[
                  {
                    icon: "⬡",
                    label: `${cpu} vCPU`,
                    usd:
                      BASE_PRICE.cpu *
                      cpu *
                      hours *
                      PRICE_MULTIPLIERS[provider],
                  },
                  {
                    icon: "▣",
                    label: `${ram} GB RAM`,
                    usd:
                      BASE_PRICE.ram *
                      ram *
                      hours *
                      PRICE_MULTIPLIERS[provider],
                  },
                  {
                    icon: "◫",
                    label: `${storage} GB SSD`,
                    usd:
                      BASE_PRICE.storage *
                      storage *
                      hours *
                      PRICE_MULTIPLIERS[provider],
                  },
                ].map(({ icon, label, usd }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-zinc-500 flex items-center gap-2">
                      <span className="text-zinc-600 font-mono text-xs">
                        {icon}
                      </span>
                      {label}
                    </span>
                    <div className="text-right">
                      <span className="text-zinc-300 font-mono text-xs">
                        {formatSOL(usd)} SOL
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px] block">
                        ${usd.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/[0.08] mb-4" />

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-zinc-400 font-mono">
                  <span>Per hour</span>
                  <span>
                    {hourlySOL.toFixed(4)} SOL{" "}
                    <span className="text-zinc-600">
                      (${hourlyUSD.toFixed(3)})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 font-mono">
                  <span>Per second</span>
                  <span>{perSecSOL.toFixed(9)} SOL</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/rent"
                className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4 opacity-60"
                  fill="currentColor"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M10 5.5c2.5 0 4 1.5 4 3.5 0 1.5-1 2.5-2.5 3l-.5 2h-2l-.5-2C7 11.5 6 10.5 6 9c0-2 1.5-3.5 4-3.5z" />
                </svg>
                Deploy with this config
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>

              <p className="text-center text-zinc-600 text-[10px] mt-3 font-mono leading-relaxed">
                No account needed · Connect wallet to deploy · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
