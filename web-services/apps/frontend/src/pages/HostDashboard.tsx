import { motion } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { useCallback, useEffect, useState } from "react";
import { type Machine } from "../../types/depinMachines";
import { api } from "@/lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { DashboardTable } from "@/components/DepinHostDashboard/Table";
import { useIndexerEvents } from "@/lib/useIndexerEvents";
import { toast } from "sonner";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";

function SkeletonSummary() {
  return (
    <div className="flex items-center gap-12 mb-12 pb-8 border-b border-black/[0.06] dark:border-white/[0.06] animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-20 mb-1" />
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-5 border-b border-black/[0.04] dark:border-white/[0.04] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32 mb-1" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
        </div>
      </div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
    </div>
  );
}

export function HostDashboard() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);

  useIndexerEvents({
    account: wallet.publicKey?.toBase58(),
    onEvent: (event) => {
      if (event.instruction === "activate_host") {
        const id = event.args?.id as string;
        setMachines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isActive: true } : m)),
        );
        toast.success("Host activated on-chain", { position: "bottom-right" });
      }
      if (event.instruction === "deactivate_host") {
        const id = event.args?.id as string;
        setMachines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isActive: false } : m)),
        );
        toast.info("Host deactivated", { position: "bottom-right" });
      }
      if (event.instruction === "penalize_host") {
        const id = event.args?.id as string;
        setMachines((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isActive: false, verified: false } : m,
          ),
        );
        toast.error("Host penalized", { position: "bottom-right" });
      }
    },
  });

  const fetchMachines = useCallback(async () => {
    const pubKey = wallet.publicKey?.toBase58();
    if (!pubKey) return;
    setLoading(true);
    setError(false);
    try {
      const r = await api.get(`/user/depin/getAll?userPublicKey=${pubKey}`);
      if (r.status === 200) setMachines(r.data);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [wallet.publicKey]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const active = machines.filter((m) => m.isActive).length;
  const totalEarned = machines.reduce((s, m) => s + m.claimedSOL, 0);

  return (
    <div
      className="min-h-screen bg-background pt-28 pb-40 px-6"
      aria-live="polite"
    >
      <BackgroundGlow
        color="rgba(16,185,129,0.06)"
        size="40% 25%"
        position="60% 5%"
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="h-px w-6 bg-emerald-500/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              Host Dashboard
            </span>
          </motion.div>

          <div className="flex items-end justify-between gap-6">
            <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-zinc-950 dark:text-white">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  Your nodes
                </motion.span>
              </span>
            </h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/depin/register")}
              className="shrink-0 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors group pb-1"
            >
              Add machine
              <span className="group-hover:translate-x-0.5 transition-transform inline-block">
                →
              </span>
            </motion.button>
          </div>
        </div>

        {timedOut && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <p className="text-zinc-500 text-sm mb-6">
              Loading is taking longer than expected. Please try again.
            </p>
            <Button onClick={fetchMachines}>Retry</Button>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">
              Failed to load machines
            </h2>
            <p className="text-zinc-500 text-sm mb-6">
              Something went wrong while fetching your machines.
            </p>
            <button
              onClick={fetchMachines}
              className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#9945FF] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </motion.div>
        ) : loading ? (
          <>
            <SkeletonSummary />
            <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
              {[...Array(3)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-12 mb-12 pb-8 border-b border-black/[0.06] dark:border-white/[0.06]"
            >
              {[
                { label: "Total machines", value: String(machines.length) },
                { label: "Active", value: String(active), accent: active > 0 },
                {
                  label: "Total earned",
                  value: `${totalEarned.toFixed(4)} SOL`,
                  green: true,
                },
              ].map((s) => (
                <div key={s.label}>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
                    {s.label}
                  </span>
                  <span
                    className={`text-2xl font-light font-mono tabular-nums ${s.green ? "text-emerald-500" : "text-zinc-950 dark:text-white"}`}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {machines.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-4">
                    No machines registered yet.
                  </p>
                  <button
                    onClick={() => navigate("/depin/register")}
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#9945FF] transition-colors"
                  >
                    Register your first machine →
                  </button>
                </div>
              ) : (
                <DashboardTable machines={machines} setMachines={setMachines} />
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
