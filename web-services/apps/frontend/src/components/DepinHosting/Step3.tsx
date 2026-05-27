import { CheckCircle } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { onboardingScript } from "./constants/scripts";
import { useNavigate } from "react-router-dom";

export const Step3 = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-6 py-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#14F195]/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-[#14F195]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Verification Successful!
        </h3>
        <p className="text-xs text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
          Your machine is verified. Run this final script to install the Axion
          agent, and start earning SOL.
        </p>
        <div className="text-left max-w-lg mx-auto">
          <CodeBlock script={onboardingScript} />
        </div>
        <button
          onClick={() => navigate("/depin/host/dashboard")}
          className="group relative mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white overflow-hidden transition-all duration-300 cursor-pointer"
        >
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF]/80 via-[#14F195] to-[#9945FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="absolute inset-0 rounded-lg border border-white/[0.12]" />
          <span className="relative z-10">Complete Onboarding →</span>
        </button>
      </div>
    </div>
  );
};
