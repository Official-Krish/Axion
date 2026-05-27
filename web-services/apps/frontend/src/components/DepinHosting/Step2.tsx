import { CodeBlock } from "./CodeBlock";
import { Loader2, Terminal } from "lucide-react";
import { verificationScript } from "./constants/scripts";

interface Step2Props {
  handleStep2Verify: () => Promise<void>;
  isLoading: boolean;
}

export const Step2 = ({ handleStep2Verify, isLoading }: Step2Props) => {
  return (
    <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/10 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-[#9945FF]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Run Verification Script
            </h3>
            <p className="text-[11px] text-zinc-500">
              Prove machine ownership and specs
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Copy and run this command on your machine. This allows us to verify
          its specs and availability before adding it to the network.
        </p>
        <CodeBlock script={verificationScript} />
        <p className="text-xs text-zinc-500 mt-4 mb-6 leading-relaxed">
          After running the script, click the button below. We will check for a
          successful connection from your machine.
        </p>
        <button
          onClick={handleStep2Verify}
          disabled={isLoading}
          className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white overflow-hidden transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF]/80 via-[#14F195] to-[#9945FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="absolute inset-0 rounded-lg border border-white/[0.12]" />
          <span className="relative z-10 flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Verifying..." : "I Have Run the Script"}
          </span>
        </button>
      </div>
    </div>
  );
};
