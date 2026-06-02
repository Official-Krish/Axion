import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getVmDetails } from "@/lib/vm";
import type { VM } from "types/vm";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";

export const Hardware = ({ vm }: { vm: VM }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Hardware Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-3 mx-auto">
                <Cpu className="h-6 w-6 text-cyan-600" />
              </div>
              {vm.provider === "LOCAL" ? (
                <div className="text-2xl font-bold mb-1">{vm.VMImage.cpu}</div>
              ) : (
                <div className="text-2xl font-bold mb-1">
                  {getVmDetails(vm.VMConfig.machineType).cpu}
                </div>
              )}
              <div className="text-sm text-muted-foreground">vCPUs</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl mb-3 mx-auto">
                <MemoryStick className="h-6 w-6 text-emerald-600" />
              </div>
              {vm.provider === "LOCAL" ? (
                <div className="text-2xl font-bold mb-1">
                  {vm.VMImage.ram} GB
                </div>
              ) : (
                <div className="text-2xl font-bold mb-1">
                  {getVmDetails(vm.VMConfig.machineType).ram} GB
                </div>
              )}
              <div className="text-sm text-muted-foreground">Ram</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-3 mx-auto">
                <HardDrive className="h-6 w-6 text-amber-600" />
              </div>
              {vm.provider === "LOCAL" ? (
                <div className="text-2xl font-bold mb-1">
                  {vm.VMImage.diskSize} GB
                </div>
              ) : (
                <div className="text-2xl font-bold mb-1">
                  {vm.VMConfig.diskSize} GB
                </div>
              )}
              <div className="text-sm text-muted-foreground">Disk Storage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
