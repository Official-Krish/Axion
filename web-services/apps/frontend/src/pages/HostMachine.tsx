import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Step1 } from "@/components/DepinHosting/Step1";
import { Step2 } from "@/components/DepinHosting/Step2";
import { Step3 } from "@/components/DepinHosting/Step3";
import axios from "axios";
import { DEPIN_WORKER } from "@/config";
import { useNavigate, Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { IconCheck, IconCoins } from "@tabler/icons-react";

const STEP_LABELS = ["Machine Details", "Verification", "Activation"];

export function HostRegister() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    machineType: "",
    ipAddress: "",
    cpu: 0,
    ram: 0,
    diskSize: 0,
    region: "",
    os: "",
    Key: "",
  });

  const estimatedEarnings = useMemo(() => {
    const cpuScore = formData.cpu * 0.15;
    const ramScore = formData.ram * 0.04;
    const storageScore = formData.diskSize * 0.002;
    return Math.max(0, cpuScore + ramScore + storageScore).toFixed(2);
  }, [formData.cpu, formData.ram, formData.diskSize]);

  const handleStep1Submit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${DEPIN_WORKER}/depin/register`,
        { ...formData, userPublicKey: wallet.publicKey?.toBase58() },
        { headers: { Authorization: `${localStorage.getItem("token")}` } },
      );
      if (res.status === 200) {
        setId(res.data.vm.id);
        toast.success("Machine details saved. Proceed to verification.");
        setCurrentStep(2);
      }
    } catch {
      toast.error("Failed to save machine details.");
    }
    setIsLoading(false);
  };

  const handleStep2Verify = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        toast.error("Complete step 1 first.");
        setIsLoading(false);
        return;
      }
      const res = await axios.get(`${DEPIN_WORKER}/depin/getById?id=${id}`, {
        headers: { Authorization: `${localStorage.getItem("token")}` },
      });
      if (res.data.verified) {
        toast.success("Machine verified!");
        setCurrentStep(3);
      } else {
        toast.error("Verification failed. Ensure the script ran correctly.");
      }
    } catch {
      toast.error("Verification check failed.");
    }
    setIsLoading(false);
  };

  if (!wallet.publicKey || !localStorage.getItem("token")) {
    return (
      <div className="min-h-screen bg-[#0D0D12] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-zinc-500 text-sm mb-4">
            Connect your wallet to register a machine
          </p>
          <Link
            to="/signin"
            className="text-sm text-white hover:text-[#9945FF] transition-colors"
          >
            Sign in →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D12] pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 50% 10%, rgba(153,69,255,0.08), transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500">
              Register Node
            </span>
            {currentStep > 1 && (
              <button
                onClick={() => navigate("/host")}
                className="ml-auto text-xs text-zinc-600 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Add your machine to the network
          </h1>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            Register your hardware, run a quick verification, and start earning
            SOL by sharing your compute power.
          </p>
        </div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-0 mb-10"
        >
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = currentStep > n;
            const active = currentStep === n;
            return (
              <div
                key={label}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      done
                        ? "bg-[#14F195] text-[#0D0D12]"
                        : active
                          ? "bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white shadow-lg shadow-violet-500/20"
                          : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {done ? <IconCheck className="w-4 h-4" /> : n}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      active
                        ? "text-white"
                        : done
                          ? "text-[#14F195]"
                          : "text-zinc-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 rounded-full transition-colors duration-300 ${
                      done ? "bg-[#14F195]" : "bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Content + Earnings sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    setFormData={setFormData}
                    isLoading={isLoading}
                    handleStep1Submit={handleStep1Submit}
                    estimatedEarnings={estimatedEarnings}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    handleStep2Verify={handleStep2Verify}
                    isLoading={isLoading}
                  />
                )}
                {currentStep === 3 && <Step3 />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Earnings preview sidebar */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full lg:w-72 shrink-0"
            >
              <div className="sticky top-32 bg-[#1A1A24] border border-white/[0.07] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <IconCoins className="w-4 h-4 text-[#14F195]" />
                  <span className="text-sm font-semibold text-white">
                    Estimated Earnings
                  </span>
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">
                  ~{estimatedEarnings}
                  <span className="text-lg font-medium text-zinc-400 ml-1">
                    SOL
                  </span>
                </div>
                <p className="text-zinc-500 text-xs mt-1">per month</p>
                <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">
                      CPU ({formData.cpu || "—"} cores)
                    </span>
                    <span className="text-zinc-300">
                      +{((formData.cpu || 0) * 0.15).toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">
                      RAM ({formData.ram || "—"} GB)
                    </span>
                    <span className="text-zinc-300">
                      +{((formData.ram || 0) * 0.04).toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">
                      Storage ({formData.diskSize || "—"} GB)
                    </span>
                    <span className="text-zinc-300">
                      +{((formData.diskSize || 0) * 0.002).toFixed(2)} SOL
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Rates are estimates based on current network demand. Actual
                    earnings may vary.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
