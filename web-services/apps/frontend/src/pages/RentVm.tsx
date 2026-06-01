import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import type { FinalConfig, VMTypes } from "types/vm";
import { api } from "@/lib/api";
import { calculateEscrowEndTime, calculatePrice } from "@/lib/vm";
import { Step1 } from "@/components/RentVm/Step1";
import { Step3 } from "@/components/RentVm/Step3";
import { NavigationButton } from "@/components/RentVm/NavigationButton";
import { CostSummary } from "@/components/RentVm/CostSummary";
import { CredentialModal } from "@/components/RentVm/CredentialModal";
import { toast } from "sonner";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TransferToVaultAndStartRental } from "@/lib/contract";

import { Step2 } from "@/components/RentVm/Step2";
import { StartRentalSessionWithEscrow } from "@/lib/Escrow";
import { usePaymentConfirmation } from "@/lib/useIndexerEvents";

export const RentVM = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vmName, setVmName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [os, setOs] = useState("");
  const [region, setRegion] = useState("");
  const [duration, setDuration] = useState(10);
  const [diskSize, setDiskSize] = useState(10);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [vms, setVms] = useState<VMTypes[]>([]);
  const [finalConfig, setFinalConfig] = useState<FinalConfig>();
  const [paymentStatus, setPaymentStatus] = useState<
    "Pending" | "Success" | "Failed" | "not_started"
  >("not_started");
  const [paymentType, setPaymentType] = useState<"duration" | "escrow">(
    "duration",
  );
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [currentVmId, setCurrentVmId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (errors.disk) setErrors((prev) => ({ ...prev, disk: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diskSize]);

  useEffect(() => {
    if (errors.duration) setErrors((prev) => ({ ...prev, duration: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    if (errors.cpu || errors.ram)
      setErrors((prev) => ({ ...prev, cpu: "", ram: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfig]);

  const wallet = useAnchorWallet();

  // Real-time on-chain payment confirmation from indexer
  const onChainStatus = usePaymentConfirmation(
    currentVmId,
    paymentType === "duration"
      ? "transfer_to_vault_and_rent"
      : "start_rental_with_escrow",
  );

  const steps = [
    {
      number: 1,
      title: "Instance Configuration",
      description: "Choose your VM configuration and basic settings",
    },
    {
      number: 2,
      title: "Payment Method",
      description: "Select payment type and configure billing",
    },
    {
      number: 3,
      title: "Review & Deploy",
      description: "Review configuration and deploy your VM",
    },
  ];
  const [isNameAvailable, setIsNameAvailable] = useState<boolean>(false);

  useEffect(() => {
    const fetchVMConfigs = async () => {
      try {
        const res = await api.get("/vm/getVMTypes");
        setVms(res.data);
      } catch {
        /* toast handled by api interceptor */
      }
    };
    fetchVMConfigs();
  }, []);

  useEffect(() => {
    const checkNameAvailability = async () => {
      if (!vmName) {
        return;
      }
      try {
        const res = await api.get(`/vm/checkNameAvailability?name=${vmName}`);
        setIsNameAvailable(res.data.available);
      } catch {
        /* toast handled by api interceptor */
      }
    };
    checkNameAvailability();
  }, [vmName]);

  const selectedVMConfig = vms.find((config) => config.id === selectedConfig);
  const [costPerMin, setCostPerMin] = useState(0);

  useEffect(() => {
    const fetchCostPerMin = async () => {
      if (selectedVMConfig) {
        const price = await calculatePrice(
          selectedVMConfig.machineType,
          diskSize,
          1,
        );
        setCostPerMin(Number(price));
      }
    };
    fetchCostPerMin();
  }, [selectedVMConfig, diskSize]);

  const canProceedToStep2 = vmName && selectedConfig && region && os;
  const canProceedToStep3 = !!(
    selectedVMConfig &&
    (paymentType === "duration" ? duration > 0 : escrowAmount > 0)
  );

  const handlePayment = async () => {
    const validationErrors: Record<string, string> = {};
    if (!selectedConfig) {
      validationErrors.cpu = "CPU configuration is required";
      validationErrors.ram = "RAM configuration is required";
    }
    if (!diskSize || Number(diskSize) <= 0) {
      validationErrors.disk = "Disk size must be greater than 0";
    }
    if (!duration || duration <= 0) {
      validationErrors.duration = "Duration must be greater than 0";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsConfirmOpen(false);
    setPaymentStatus("Pending");
    const id = crypto.randomUUID().substring(0, 32);
    setCurrentVmId(id);
    const tx =
      paymentType === "duration"
        ? await TransferToVaultAndStartRental(
            costPerMin * duration,
            duration,
            id,
            wallet!,
          )
        : await StartRentalSessionWithEscrow(wallet!, escrowAmount, id);

    if (!tx?.success) {
      toast.error("Transaction failed. Please try again.", {
        position: "bottom-right",
      });
      setPaymentStatus("Failed");
      return;
    }

    try {
      const endTime =
        paymentType === "duration"
          ? duration
          : await calculateEscrowEndTime(
              escrowAmount,
              selectedVMConfig!.machineType,
              diskSize,
            );
      const res = await api.post("/vmInstance/create", {
        id,
        name: vmName.toLowerCase(),
        paymentType: paymentType.toUpperCase(),
        price:
          paymentType === "duration" ? costPerMin * duration : escrowAmount,
        region,
        os,
        diskSize: diskSize.toString(),
        endTime: endTime,
        machineType: selectedVMConfig?.machineType,
        provider: "GCP",
      });
      if (res.status === 200) {
        setPaymentStatus("Success");
        toast.success("VM instance created successfully!", {
          position: "bottom-right",
        });
        setFinalConfig({
          vmId: res.data.vmId,
          instanceId: res.data.instanceId,
          ipAddress: res.data.ip,
          privateKey: res.data.PrivateKey,
          AuthToken: res.data.AuthToken,
        });
        setIsCredentialsOpen(true);
      } else {
        toast.error(`Failed to create VM instance.`, {
          position: "bottom-right",
        });
      }
    } catch {
      setPaymentStatus("Failed");
    }
  };

  if (paymentStatus === "Pending") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center items-center"
        >
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
            <h1 className="text-3xl font-bold mb-4">Processing Payment</h1>
            <p className="text-muted-foreground mb-2">
              Please wait while we process your payment...
            </p>
            <p className="text-sm text-muted-foreground">
              On-chain status:{" "}
              <span
                className={
                  onChainStatus === "confirmed"
                    ? "text-green-500 font-semibold"
                    : onChainStatus === "failed"
                      ? "text-red-500 font-semibold"
                      : "text-yellow-500"
                }
              >
                {onChainStatus}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Rent VM Instance</h1>
        <p className="text-muted-foreground">
          Deploy your virtual machine with predefined configurations
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-8 mb-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.number
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <Step1
              vms={vms}
              vmName={vmName}
              setVmName={setVmName}
              diskSize={diskSize}
              setDiskSize={setDiskSize}
              region={region}
              setRegion={setRegion}
              os={os}
              setOs={setOs}
              isNameAvailable={isNameAvailable}
              selectedVMConfig={selectedVMConfig || null}
              setSelectedVMConfig={(config) =>
                setSelectedConfig(config?.id || "")
              }
              setStep={setCurrentStep}
              selectedConfig={selectedConfig}
              setSelectedConfig={setSelectedConfig}
            />
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <Step2
              selectedVMConfig={selectedVMConfig || null}
              duration={duration}
              paymentType={paymentType}
              setDuration={setDuration}
              setPaymentType={setPaymentType}
              setEscrowAmount={setEscrowAmount}
              escrowAmount={escrowAmount}
              diskSize={diskSize}
            />
          )}

          {/* Step 2: Review */}
          {currentStep === 3 && (
            <Step3
              vmName={vmName}
              selectedVMConfig={selectedVMConfig || null}
              diskSize={diskSize}
              region={region}
              os={os}
              duration={duration}
              paymentType={paymentType}
              escrowAmount={escrowAmount}
            />
          )}

          {Object.keys(errors).length > 0 && (
            <div className="space-y-1 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              {Object.entries(errors).map(([key, msg]) => (
                <p key={key} className="text-sm text-red-500">
                  {msg}
                </p>
              ))}
            </div>
          )}
          {/* Navigation Buttons */}
          <NavigationButton
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            canProceedToStep2={canProceedToStep2}
            isConfirmOpen={isConfirmOpen}
            setIsConfirmOpen={setIsConfirmOpen}
            costPerMin={costPerMin}
            duration={duration}
            escrowAmount={escrowAmount}
            canProceedToStep3={canProceedToStep3}
            paymentType={paymentType}
            handlePayment={() => {
              handlePayment();
            }}
          />
        </div>

        {/* Cost Summary Sidebar */}
        <CostSummary
          selectedVMConfig={selectedVMConfig || null}
          costPerMin={costPerMin}
          duration={duration}
          paymentType={paymentType}
          escrowAmount={escrowAmount}
          diskSize={diskSize}
        />
      </div>

      {/* VM Credentials Modal */}
      <CredentialModal
        isCredentialsOpen={isCredentialsOpen}
        setIsCredentialsOpen={setIsCredentialsOpen}
        vmName={vmName}
        region={region}
        finalConfig={finalConfig}
      />
    </div>
  );
};
