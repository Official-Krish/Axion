import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const CodeBlock = ({ script }: { script: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-[#0D0D12] rounded-lg overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/[0.04]">
        <span className="text-[11px] text-zinc-500 font-mono">bash</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#14F195]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
        <code>{script}</code>
      </pre>
    </div>
  );
};
