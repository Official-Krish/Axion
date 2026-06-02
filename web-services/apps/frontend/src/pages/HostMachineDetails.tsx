import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { api } from "@/lib/api";
import { type Machine } from "../../types/depinMachines";

function StatRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
      <span className="text-xs tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span
        className={`text-sm text-zinc-800 dark:text-zinc-200 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function HostMachineDetails() {
  const { id } = useParams<{ id: string }>();
  const wallet = useWallet();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);

  const fetchMachine = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await api.get(
        `/user/depin/getAll?userPublicKey=${wallet.publicKey?.toBase58() ?? ""}`,
      );
      setMachine(r.data.find((m: Machine) => m.id === id) ?? null);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [wallet.publicKey, id]);

  useEffect(() => {
    fetchMachine();
  }, [fetchMachine]);

  if (timedOut && !error) {
    return (
      <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 flex items-center justify-center mt-16">
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm mb-6">
            Loading is taking longer than expected. Please try again.
          </p>
          <Button onClick={fetchMachine}>Retry</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-5 h-5 border border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm mb-4">
            Failed to load machine details.
          </p>
          <button
            onClick={fetchMachine}
            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors flex items-center gap-1 justify-center mx-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-zinc-500 text-sm mb-4">Machine not found</p>
          <Link
            to="/depin/host/dashboard"
            className="text-sm hover:text-[#9945FF] transition-colors"
          >
            ← Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-40 px-6">
      <BackgroundGlow
        color="rgba(153,69,255,0.05)"
        size="40% 30%"
        position="60% 0%"
      />

      <div className="max-w-3xl mx-auto">
        {/* back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <Link
            to="/depin/host/dashboard"
            className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            ← Host Dashboard
          </Link>
        </motion.div>

        {/* header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.span
              className={`w-2 h-2 rounded-full ${machine.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}`}
              animate={machine.isActive ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              {machine.isActive ? "Active" : "Inactive"}
              {machine.isOccupied && " · Occupied"}
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {machine.machineType}
              </motion.span>
            </span>
          </h1>
        </div>

        {/* specs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
            Hardware
          </span>
          <div className="border-t border-black/[0.06] dark:border-white/[0.06] mb-10">
            <StatRow label="CPU" value={`${machine.cpu} vCPU`} />
            <StatRow label="Memory" value={`${machine.ram} GB RAM`} />
            <StatRow label="Disk" value={`${machine.diskSize} GB SSD`} />
            <StatRow label="Region" value={machine.region} />
            <StatRow label="IP Address" value={machine.ipAddress || "—"} mono />
          </div>

          <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
            Economics
          </span>
          <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
            <StatRow
              label="Rate"
              value={`${machine.PerHourPrice} SOL / hr`}
              mono
            />
            <StatRow
              label="Rewards earned"
              value={`${machine.claimedSOL} SOL`}
              mono
            />
          </div>
        </motion.div>

        {machine.claimedSOL > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Link
              to="/depin/rewards"
              className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Claim {machine.claimedSOL} SOL →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
