import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Container, Cpu, HardDrive, Check } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Machine } from "types/depinMachines";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface FormProps {
  formData: {
    appName: string;
    dockerImage: string;
    description: string;
    cpu: string;
    ram: string;
    diskSize: string;
    ports: string;
    envVars: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      appName: string;
      dockerImage: string;
      description: string;
      cpu: string;
      ram: string;
      diskSize: string;
      ports: string;
      envVars: string;
    }>
  >;
  setVm: (vm: Machine) => void;
  setStep: (step: number) => void;
}

export const Form = ({ formData, setFormData, setVm, setStep }: FormProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.appName) {
      newErrors.appName = "Application name is required";
    }
    if (!formData.dockerImage) {
      newErrors.dockerImage = "Docker image is required";
    } else if (
      !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*(:[a-zA-Z0-9._-]+)?$/.test(
        formData.dockerImage,
      )
    ) {
      newErrors.dockerImage = "Invalid image format (e.g. nginx:latest)";
    }
    if (!formData.cpu) {
      newErrors.cpu = "CPU is required";
    } else if (Number(formData.cpu) <= 0) {
      newErrors.cpu = "CPU must be greater than 0";
    }
    if (!formData.ram) {
      newErrors.ram = "RAM is required";
    } else if (Number(formData.ram) <= 0) {
      newErrors.ram = "RAM must be greater than 0";
    }
    if (!formData.diskSize) {
      newErrors.diskSize = "Disk size is required";
    } else if (Number(formData.diskSize) <= 0) {
      newErrors.diskSize = "Disk size must be greater than 0";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSearching(true);
    try {
      const res = await api.post("/user/depin/findVM", {
        cpu: formData.cpu,
        ram: formData.ram,
        diskSize: formData.diskSize,
        dockerImage: formData.dockerImage,
      });
      if (res.status === 200) {
        toast.success("VM found successfully!");
        setSearchSuccess(true);
        await new Promise((r) => setTimeout(r, 800));
        setVm(res.data.vm);
        setStep(1);
      } else {
        toast.error("Failed to find VM. Please try again.");
      }
    } catch {
      toast.error("Failed to find vm. Please try again.");
    }
    setIsSearching(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10"
    >
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Container className="h-5 w-5" />
            <span>Application Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your Docker container deployment settings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-6"
            role="form"
            aria-label="Application Configuration Form"
          >
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="appName" className="mb-4">
                  Application Name
                </Label>
                <Input
                  id="appName"
                  placeholder="my-awesome-app"
                  value={formData.appName}
                  onChange={(e) => {
                    setFormData({ ...formData, appName: e.target.value });
                    setErrors((prev) => ({ ...prev, appName: "" }));
                  }}
                  required
                  className={errors.appName ? "animate-shake" : ""}
                />
                {errors.appName && (
                  <p className="text-sm text-red-500 mt-1">{errors.appName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dockerImage" className="mb-4">
                  Docker Image
                </Label>
                <Input
                  id="dockerImage"
                  placeholder="nginx:latest or myregistry/myapp:v1.0"
                  value={formData.dockerImage}
                  onChange={(e) => {
                    setFormData({ ...formData, dockerImage: e.target.value });
                    setErrors((prev) => ({ ...prev, dockerImage: "" }));
                  }}
                  required
                  className={errors.dockerImage ? "animate-shake" : ""}
                />
                {errors.dockerImage && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.dockerImage}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="mb-4">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your application..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Resource Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Resource Configuration
                </Label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="cpu"
                    className="flex items-center space-x-2 mb-3"
                  >
                    <Cpu className="h-4 w-4" />
                    <span>CPU Cores</span>
                  </Label>
                  <Select
                    value={formData.cpu}
                    onValueChange={(value) => {
                      setFormData({ ...formData, cpu: value });
                      setErrors((prev) => ({ ...prev, cpu: "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5 cores</SelectItem>
                      <SelectItem value="1">1 core</SelectItem>
                      <SelectItem value="2">2 cores</SelectItem>
                      <SelectItem value="4">4 cores</SelectItem>
                      <SelectItem value="8">8 cores</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cpu && (
                    <p className="text-sm text-red-500 mt-1">{errors.cpu}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="memory"
                    className="flex items-center space-x-2 mb-3"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>Memory (GB)</span>
                  </Label>
                  <Select
                    value={formData.ram}
                    onValueChange={(value) => {
                      setFormData({ ...formData, ram: value });
                      setErrors((prev) => ({ ...prev, ram: "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">512 MB</SelectItem>
                      <SelectItem value="1">1 GB</SelectItem>
                      <SelectItem value="2">2 GB</SelectItem>
                      <SelectItem value="4">4 GB</SelectItem>
                      <SelectItem value="8">8 GB</SelectItem>
                      <SelectItem value="16">16 GB</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.ram && (
                    <p className="text-sm text-red-500 mt-1">{errors.ram}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="storage"
                    className="flex items-center space-x-2 mb-3"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>Storage (GB)</span>
                  </Label>
                  <Input
                    id="storage"
                    type="number"
                    value={formData.diskSize}
                    onChange={(e) => {
                      setFormData({ ...formData, diskSize: e.target.value });
                      setErrors((prev) => ({ ...prev, diskSize: "" }));
                    }}
                    min="1"
                    max="1000"
                    className={errors.diskSize ? "animate-shake" : ""}
                  />
                  {errors.diskSize && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.diskSize}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ports" className="mb-3">
                    Ports (comma separated)
                  </Label>
                  <Input
                    id="ports"
                    placeholder="80,443,3000"
                    value={formData.ports}
                    onChange={(e) =>
                      setFormData({ ...formData, ports: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <Label htmlFor="envVars" className="mb-3">
                Environment Variables (separate each with a comma)
              </Label>
              <Textarea
                id="envVars"
                placeholder="KEY1=value1,&#10;KEY2=value2,&#10;DB_URL=mongodb://..."
                value={formData.envVars}
                onChange={(e) =>
                  setFormData({ ...formData, envVars: e.target.value })
                }
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              size="lg"
              onClick={handleSubmit}
              disabled={isSearching || searchSuccess}
            >
              {searchSuccess ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Found!
                </span>
              ) : isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                "Search VM"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
