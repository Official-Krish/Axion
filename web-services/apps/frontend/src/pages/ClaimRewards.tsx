import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { Link } from "react-router-dom";
import { type Machine } from "../../types/depinMachines";
import { toast } from "sonner";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { api } from "@/lib/api";

// per-machine claim status
type ClaimStatus = "idle" | "submitted" | "confirmed" | "failed";

function MachineRow({
  m,
  i,
  onClaim,
  claimStatus,
}: {
  m: Machine;
  i: number;
  onClaim: (id: string) => void;
  claimStatus: ClaimStatus;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const hasFunds = m.claimedSOL > 0;
  const busy = claimStatus === "submitted";

  const label =
    claimStatus === "submitted"
      ? "confirming…"
      : claimStatus === "confirmed"
        ? "confirmed ✓"
        : claimStatus === "failed"
          ? "failed ✗"
          : "Claim →";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="flex items-center justify-between py-5 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
    >
      <div className="flex items-center gap-4">
        <motion.span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-700"}`}
          animate={m.isActive ? { opacity: [1, 0.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200">
            {m.machineType}
          </p>
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
            {m.region} · {m.cpu} vCPU · {m.ram} GB
          </p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span
          className={`text-sm font-mono tabular-nums ${hasFunds ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-600"}`}
        >
          {m.claimedSOL.toFixed(4)} SOL
        </span>
        <button
          disabled={!hasFunds || busy}
          onClick={() => onClaim(m.id)}
          className={`text-xs transition-colors duration-200 ${
            claimStatus === "confirmed"
              ? "text-emerald-500"
              : claimStatus === "failed"
                ? "text-red-500"
                : hasFunds && !busy
                  ? "text-zinc-900 dark:text-white hover:text-[#9945FF]"
                  : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
          }`}
        >
          {busy ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {label}
            </motion.span>
          ) : (
            label
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function ClaimRewards() {
  const wallet = useWallet();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);
  // per-machine claim status
  const [claimStatuses, setClaimStatuses] = useState<
    Record<string, ClaimStatus>
  >({});

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await api.get(
        `/user/depin/getAll?userPublicKey=${wallet.publicKey?.toBase58() ?? ""}`,
      );
      setMachines(r.data);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [wallet.publicKey]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const setStatus = (id: string, s: ClaimStatus) =>
    setClaimStatuses((p) => ({ ...p, [id]: s }));

  const handleClaim = async (id: string) => {
    setStatus(id, "submitted");
    try {
      const res = await api.post("/user/depin/claimSOL", {
        id,
        pubKey: wallet.publicKey?.toBase58() ?? "",
      });
      if (res.status === 200) {
        setStatus(id, "confirmed");
        toast.success("Claim submitted. Rewards will arrive shortly.");
        setTimeout(() => setStatus(id, "idle"), 3000);
      }
    } catch (e: unknown) {
      setStatus(id, "failed");
      toast.error(e instanceof Error ? e.message : "Claim failed");
      setTimeout(() => setStatus(id, "idle"), 3000);
    }
  };

  const total = machines.reduce((s, m) => s + m.claimedSOL, 0);

  return (
    <div
      className="min-h-screen bg-background pt-28 pb-40 px-6"
      aria-live="polite"
    >
      <BackgroundGlow
        color="rgba(16,185,129,0.06)"
        size="50% 30%"
        position="50% 0%"
      />

      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="h-px w-6 bg-emerald-500/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              DePIN Rewards
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
                Claim SOL
              </motion.span>
            </span>
          </h1>
        </div>

        {/* total */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12 pb-8 border-b border-black/[0.06] dark:border-white/[0.06]"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
            Total available
          </span>
          <span className="text-4xl font-light font-mono tabular-nums text-emerald-500">
            {total.toFixed(4)} SOL
          </span>
        </motion.div>

        {/* machines */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
          {timedOut && !error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Loading is taking longer than expected. Please try again.
              </p>
              <Button onClick={fetchMachines} className="mt-4">
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="py-12 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full"
              />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-4">
                Failed to load machines.
              </p>
              <button
                onClick={fetchMachines}
                className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors flex items-center gap-1 justify-center mx-auto"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          ) : machines.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-4">
                No machines registered yet.
              </p>
              <Link
                to="/depin/register"
                className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[#9945FF] transition-colors"
              >
                Register a machine →
              </Link>
            </div>
          ) : (
            machines.map((m, i) => (
              <MachineRow
                key={m.id}
                m={m}
                i={i}
                onClaim={handleClaim}
                claimStatus={claimStatuses[m.id] ?? "idle"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
