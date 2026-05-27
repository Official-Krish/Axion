import { Globe, Key, Loader2, Eye, EyeOff, Cpu } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { operatingSystems, regions } from "@/lib/constants";
import { Slider } from "../ui/slider";
import { useState, useMemo } from "react";

interface Step1Props {
  handleStep1Submit: () => void;
  formData: {
    machineType: string;
    ipAddress: string;
    cpu: number;
    ram: number;
    diskSize: number;
    region: string;
    os: string;
    Key: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      machineType: string;
      ipAddress: string;
      cpu: number;
      ram: number;
      diskSize: number;
      region: string;
      os: string;
      Key: string;
    }>
  >;
  isLoading: boolean;
  estimatedEarnings?: string;
}

function StrengthBar({ value }: { value: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  }, [value]);

  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-[#14F195]",
    "bg-[#14F195]",
  ];

  if (!value) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? colors[i] : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-[11px] font-medium ${
          strength <= 2 ? "text-red-400" : "text-[#14F195]"
        }`}
      >
        {strength > 0 ? labels[strength - 1] : ""}
      </p>
    </div>
  );
}

export const Step1 = ({
  handleStep1Submit,
  formData,
  setFormData,
  isLoading,
}: Step1Props) => {
  const [showKey, setShowKey] = useState(false);
  const machineTypes = ["e2-medium", "e2-small", "e2-micro", "e2-standard"];

  return (
    <div className="bg-[#1A1A24] border border-white/[0.07] rounded-xl overflow-hidden">
      {/* Section: Machine Specs */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/10 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#9945FF]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Machine Specifications
            </h3>
            <p className="text-[11px] text-zinc-500">
              Define your hardware resources
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {/* CPU */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="cpu"
                className="text-xs text-zinc-400 font-medium"
              >
                CPU Cores
              </Label>
              <span className="text-sm font-semibold text-white tabular-nums">
                {formData.cpu}
              </span>
            </div>
            <Slider
              id="cpu"
              min={1}
              max={64}
              step={1}
              value={[formData.cpu]}
              onValueChange={([v]) => setFormData({ ...formData, cpu: v })}
              className="[&_[data-slot=slider-track]]:bg-zinc-800 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#9945FF] [&_[data-slot=slider-range]]:to-[#14F195] [&_[data-slot=slider-thumb]]:border-[#9945FF] [&_[data-slot=slider-thumb]]:bg-[#0D0D12]"
            />
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>1 core</span>
              <span>64 cores</span>
            </div>
          </div>
          {/* RAM */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="ram"
                className="text-xs text-zinc-400 font-medium"
              >
                RAM
              </Label>
              <span className="text-sm font-semibold text-white tabular-nums">
                {formData.ram} GB
              </span>
            </div>
            <Slider
              id="ram"
              min={2}
              max={512}
              step={2}
              value={[formData.ram]}
              onValueChange={([v]) => setFormData({ ...formData, ram: v })}
              className="[&_[data-slot=slider-track]]:bg-zinc-800 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#9945FF] [&_[data-slot=slider-range]]:to-[#14F195] [&_[data-slot=slider-thumb]]:border-[#9945FF] [&_[data-slot=slider-thumb]]:bg-[#0D0D12]"
            />
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>2 GB</span>
              <span>512 GB</span>
            </div>
          </div>
          {/* Storage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="diskSize"
                className="text-xs text-zinc-400 font-medium"
              >
                Storage
              </Label>
              <span className="text-sm font-semibold text-white tabular-nums">
                {formData.diskSize} GB
              </span>
            </div>
            <Slider
              id="diskSize"
              min={10}
              max={2000}
              step={10}
              value={[formData.diskSize]}
              onValueChange={([v]) => setFormData({ ...formData, diskSize: v })}
              className="[&_[data-slot=slider-track]]:bg-zinc-800 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#9945FF] [&_[data-slot=slider-range]]:to-[#14F195] [&_[data-slot=slider-thumb]]:border-[#9945FF] [&_[data-slot=slider-thumb]]:bg-[#0D0D12]"
            />
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>10 GB</span>
              <span>2 TB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Network Configuration */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Network Configuration
            </h3>
            <p className="text-[11px] text-zinc-500">
              Machine type, IP, and location
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="machineType"
              className="text-xs text-zinc-400 font-medium"
            >
              Machine Type
            </Label>
            <Select
              value={formData.machineType}
              onValueChange={(value) =>
                setFormData({ ...formData, machineType: value })
              }
              required
            >
              <SelectTrigger className="bg-[#0D0D12] border-white/[0.07] text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A24] border-white/[0.07] text-white">
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="ipAddress"
              className="text-xs text-zinc-400 font-medium"
            >
              Public IP Address
            </Label>
            <Input
              id="ipAddress"
              placeholder="e.g., 203.0.113.1"
              value={formData.ipAddress}
              onChange={(e) =>
                setFormData({ ...formData, ipAddress: e.target.value })
              }
              required
              className="bg-[#0D0D12] border-white/[0.07] text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="region"
              className="text-xs text-zinc-400 font-medium"
            >
              Region
            </Label>
            <Select
              value={formData.region}
              onValueChange={(value) =>
                setFormData({ ...formData, region: value })
              }
              required
            >
              <SelectTrigger className="bg-[#0D0D12] border-white/[0.07] text-white">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A24] border-white/[0.07] text-white">
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    <div className="flex items-center gap-2">
                      <span>{region.label}</span>
                      <span className="text-[11px] text-zinc-500">
                        {region.latency}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="os" className="text-xs text-zinc-400 font-medium">
              Operating System
            </Label>
            <Select
              value={formData.os}
              onValueChange={(value) => setFormData({ ...formData, os: value })}
              required
            >
              <SelectTrigger className="bg-[#0D0D12] border-white/[0.07] text-white">
                <SelectValue placeholder="Select OS" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A24] border-white/[0.07] text-white">
                {operatingSystems.map((os) => (
                  <SelectItem key={os.value} value={os.value}>
                    {os.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section: Authentication */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Authentication</h3>
            <p className="text-[11px] text-zinc-500">
              Secure your machine access
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="authKey"
            className="text-xs text-zinc-400 font-medium"
          >
            Authentication Key
          </Label>
          <div className="relative">
            <Input
              id="authKey"
              type={showKey ? "text" : "password"}
              placeholder="Enter a secure key for your machine"
              value={formData.Key}
              onChange={(e) =>
                setFormData({ ...formData, Key: e.target.value })
              }
              required
              className="bg-[#0D0D12] border-white/[0.07] text-white placeholder:text-zinc-600 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <StrengthBar value={formData.Key} />
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          onClick={handleStep1Submit}
          className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white overflow-hidden transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#9945FF]/80 via-[#14F195] to-[#9945FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="absolute inset-0 rounded-lg border border-white/[0.12]" />
          <span className="relative z-10 flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save & Proceed to Verification"}
          </span>
        </button>
      </div>
    </div>
  );
};
