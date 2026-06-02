import { motion } from "motion/react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { type VM } from "../../types/vm";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Header } from "@/components/vmDetail/Header";
import { Sidebar } from "@/components/vmDetail/Sidebar";
import { Overview } from "@/components/vmDetail/Overview";
import { Hardware } from "@/components/vmDetail/Hardware";
import { SSH } from "@/components/vmDetail/SSH";
import { BillingStatus } from "@/components/vmDetail/BillingStatus";
import { useIndexerEvents } from "@/lib/useIndexerEvents";
import { toast } from "sonner";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";

function SkeletonBlock() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function VMDetails() {
  const wallet = useAnchorWallet();
  const { id } = useParams();
  const [vm, setVm] = useState<VM>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);

  useIndexerEvents({
    account: wallet?.publicKey?.toBase58(),
    instruction: undefined,
    onEvent: (event) => {
      const eventId = event.args?.id as string;
      if (eventId !== id) return;

      if (
        event.instruction === "end_rental_session" ||
        event.instruction === "finalise_rental_with_escrow" ||
        event.instruction === "force_terminate_rental"
      ) {
        setVm((prev) => (prev ? { ...prev, status: "DELETED" } : prev));
        toast.info("VM terminated on-chain", { position: "bottom-right" });
      }
      if (event.instruction === "top_up_escrow") {
        toast.success(`Escrow topped up: ${event.args?.amount} lamports`, {
          position: "bottom-right",
        });
      }
    },
  });

  const fetchVMDetails = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/vmInstance/getDetails?id=${id}`);
      setVm(response.data.vmInstance);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchVMDetails();
  }, [fetchVMDetails]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to load VM details</h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong while fetching this virtual machine.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchVMDetails} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (timedOut && !error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Loading is taking longer than expected. Please try again.
          </p>
          <Button onClick={fetchVMDetails} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !vm) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-border/50 p-6">
              <SkeletonBlock />
            </div>
            <div className="rounded-2xl border border-border/50 p-6">
              <SkeletonBlock />
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 p-6">
            <SkeletonBlock />
          </div>
        </div>
      </div>
    );
  }

  if (!vm) return null;

  if (vm.status === "DELETED") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-4">VM Deleted</h1>
          <p className="text-muted-foreground mb-6">
            This virtual machine has been deleted.
          </p>
          <Link to="/dashboard">
            <Button className="cursor-pointer">Back to Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      aria-live="polite"
      layoutId={`vm-card-${id}`}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20"
    >
      <Header vm={vm} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {vm.PaymentType === "ESCROW" && <BillingStatus vm={vm} />}
          <Overview vm={vm} />
          <Hardware vm={vm} />
          {vm.provider != "LOCAL" && <SSH vm={vm} />}
        </div>

        <Sidebar vm={vm} />
      </div>
    </motion.div>
  );
}
