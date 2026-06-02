import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { toast } from "sonner";
import { type VM } from "../../types/vm";
import { Skeleton } from "@/components/Skeleton";
import { useIndexerEvents } from "@/lib/useIndexerEvents";
import { DepinHeader } from "@/components/DepinDeployment/Header";
import { DeploymentInfo } from "@/components/DepinDeployment/DeploymentInfo";
import { HostInfo } from "@/components/DepinDeployment/HostInfo";
import { EscrowCard } from "@/components/DepinDeployment/EscrowCard";
import { StopDialog } from "@/components/DepinDeployment/StopDialog";
import { SettlementSummary } from "@/components/DepinDeployment/SettlementSummary";

export function DepinDeployment() {
  const wallet = useAnchorWallet();
  const { id } = useParams();
  const [vm, setVm] = useState<VM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);
  const isTerminated = vm?.status === "DELETED" || vm?.status === "TERMINATED";

  useIndexerEvents({
    account: wallet?.publicKey?.toBase58(),
    onEvent: (event) => {
      const eventId = event.args?.id as string;
      if (eventId !== id) return;
      if (
        event.instruction === "finalise_rental_with_escrow" ||
        event.instruction === "force_terminate_rental" ||
        event.instruction === "settle_depin_job"
      ) {
        setVm((prev) => (prev ? { ...prev, status: "TERMINATED" } : prev));
        toast.info("Deployment settled on-chain", { position: "bottom-right" });
      }
    },
  });

  const fetchDeployment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/vmInstance/getDetails?id=${id}`);
      setVm(res.data.vmInstance);
    } catch {
      setError(true);
      toast.error("Failed to load deployment details", {
        position: "bottom-right",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDeployment();
  }, [fetchDeployment]);

  if (timedOut && !error) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20"
        aria-live="polite"
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Loading is taking longer than expected. Please try again.
          </p>
          <Button onClick={fetchDeployment} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20"
        aria-live="polite"
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Failed to load deployment</h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong while fetching this deployment.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchDeployment} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="cursor-pointer">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!vm) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-4">Deployment Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This deployment does not exist or has been removed.
          </p>
          <Link to="/dashboard">
            <Button className="cursor-pointer">Back to Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <DepinHeader vm={vm} />

      {isTerminated && <SettlementSummary vmId={vm.id} />}

      {!isTerminated && (
        <>
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <DeploymentInfo vm={vm} />
            <HostInfo vm={vm} />
          </div>

          <div className="space-y-6">
            <EscrowCard vm={vm} />
            <div className="flex space-x-4">
              <StopDialog
                vmId={vm.id}
                onDone={() =>
                  setVm((p) => (p ? { ...p, status: "TERMINATED" } : p))
                }
              />
              <Link to="/dashboard">
                <Button variant="outline" className="cursor-pointer">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {isTerminated && (
        <div className="mt-6">
          <Link to="/dashboard">
            <Button className="cursor-pointer">Back to Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
