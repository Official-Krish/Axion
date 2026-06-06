import { z } from "zod";
import { Router } from "express";
import { authMiddleware, logger } from "@axion/utilities";
import prisma from "@axion/db";
import {
  ChangeVMStatusSchema,
  ClaimSOLSchema,
  DepinDeployVmSchema,
  DepinVerificationSchema,
  FindVmSchema,
  RegisterVMSchema,
} from "@axion/types";
import {
  activateHostQueue,
  claimRewardsQueue,
  initialiseAccount,
  terminateDepinVMQueue,
} from "../redis";
import bcrypt from "bcrypt";
import { calculatePricePerHour } from "../utils/calculatePrice";
import { fail, getUserOr404, ok, signToken } from "../utils/helpers";
import { getCloudflareAPI } from "../utils/cloudflare";

const depinVM = Router();

// --- Resilient WS connection to depin-ws-relayer with auto-reconnect ---
const DEPIN_WS_URL = process.env.DEPIN_WS_URL || "ws://localhost:8080";
let ws: WebSocket | null = null;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;

function connectDepinWs() {
  ws = new WebSocket(DEPIN_WS_URL);
  ws.addEventListener("open", () => {
    logger.info("[depin-ws] Connected");
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
  });
  ws.addEventListener("error", (err) => logger.error("[depin-ws] Error", err));
  ws.addEventListener("close", () => {
    console.warn("[depin-ws] Disconnected, reconnecting in 3s...");
    wsReconnectTimer = setTimeout(connectDepinWs, 3000);
  });
}
connectDepinWs();

function wsSend(payload: object): boolean {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    return true;
  }
  logger.error("[depin-ws] Cannot send, not connected");
  return false;
}

// --- Helper: parse "KEY=VAL,KEY2=VAL2" into Record<string,string> ---
function parseEnvVars(envVars?: string): Record<string, string> {
  if (!envVars) return {};
  const result: Record<string, string> = {};
  for (const pair of envVars.split(",")) {
    const eq = pair.indexOf("=");
    if (eq > 0) result[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  return result;
}

let _cf: ReturnType<typeof getCloudflareAPI> | null = null;
function getCF() {
  if (!_cf) {
    try {
      _cf = getCloudflareAPI();
    } catch {
      return null;
    }
  }
  return _cf;
}

depinVM.post("/findVM", authMiddleware, async (req, res) => {
  if (!req.userId) {
    fail(res, 400, "User ID is required");
    return;
  }

  const parseData = FindVmSchema.safeParse(req.body);
  if (!parseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  try {
    const { cpu, ram, diskSize, dockerImage } = parseData.data;

    // Verify docker image exists
    const [repo, tag = "latest"] = dockerImage.includes("/")
      ? [dockerImage.split(":")[0], dockerImage.split(":")[1] || "latest"]
      : [
          `library/${dockerImage.split(":")[0]}`,
          dockerImage.split(":")[1] || "latest",
        ];

    const [registryRes, findVm] = await Promise.all([
      fetch(`https://hub.docker.com/v2/repositories/${repo}/tags/${tag}`),
      prisma.depinHostMachine.findFirst({
        where: {
          isActive: true,
          cpu: { gte: parseInt(cpu) },
          ram: { gte: parseInt(ram) },
          diskSize: { gte: parseInt(diskSize) },
          isOccupied: false,
          verified: true,
          perHourPrice: { gt: 0 },
        },
        select: {
          id: true,
          ipAddress: true,
          region: true,
          os: true,
          tunnelId: true,
          userPublicKey: true,
        },
      }),
    ]);
    if (!registryRes.ok) {
      fail(res, 400, `Docker image '${dockerImage}' not found on Docker Hub`);
      return;
    }
    if (!findVm) {
      fail(res, 404, "No suitable VM found for deployment");
      return;
    }
    ok(res, { message: "Deployment request sent successfully", vm: findVm });
  } catch (error) {
    logger.error("Error deploying image", error as Error);
    fail(res, 500, "Internal server error");
  }
});

depinVM.post("/deploy", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { publicKey: true },
  });
  if (!user) {
    fail(res, 404, "User not found");
    return;
  }

  const parseData = DepinDeployVmSchema.safeParse(req.body);
  if (!parseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  try {
    const {
      appName,
      dockerImage,
      cpu,
      ram,
      diskSize,
      ports,
      envVars,
      escrowAmount,
      endTime,
      VmId,
      id,
      description,
    } = parseData.data;
    const findVm = await prisma.depinHostMachine.findFirst({
      where: { id: VmId, isActive: true, isOccupied: false },
      select: {
        id: true,
        userPublicKey: true,
        region: true,
        ipAddress: true,
        os: true,
        tunnelId: true,
      },
    });
    if (!findVm) {
      fail(res, 404, "No suitable VM found for deployment");
      return;
    }

    const portList = ports[0]
      ? ports[0]
          .split(",")
          .map((p) => parseInt(p.trim()))
          .filter((p) => !isNaN(p))
      : [];
    const cf = getCF();
    const containerPort = portList[0] || 80;
    const subdomain = `${id}-depin.${cf?.domain || "axion.krishlabs.tech"}`;

    const [job] = await Promise.all([
      terminateDepinVMQueue.add(
        "terminate-depin-vm",
        { pubKey: user.publicKey, id: findVm.id },
        { delay: endTime * MINUTE_MS },
      ),
      activateHostQueue.add("changeVMStatus", {
        id: findVm.id,
        userPubKey: findVm.userPublicKey,
        status: true,
      }),
    ]);

    const token = signToken({ id: req.userId!, machineId: findVm.id });
    wsSend({
      type: "start-job",
      jobId: id,
      dockerImage,
      containerPort,
      subdomain,
      env: parseEnvVars(envVars),
      machineId: findVm.id,
      token,
    });

    const txn = await prisma.$transaction(async (tx) => {
      await tx.depinHostMachine.update({
        where: { id: findVm.id },
        data: { isOccupied: true },
      });

      const config = await tx.vMInstance.create({
        data: {
          id,
          name: appName,
          userId: req.userId!,
          jobId: job.id || findVm.id,
          status: "DEPLOYING",
          PaymentType: "ESCROW",
          region: findVm.region,
          ipAddress: findVm.ipAddress,
          endTime: new Date(Date.now() + Number(endTime) * MINUTE_MS),
          provider: "LOCAL",
          price: escrowAmount,
          startTime: new Date(),
        },
      });

      await tx.vMImage.create({
        data: {
          id,
          name: appName,
          description,
          dockerImage,
          cpu: parseInt(cpu),
          ram: parseInt(ram),
          diskSize: parseInt(diskSize),
          depinHostMachineId: findVm.id,
          os: findVm.os,
          applicationPort: containerPort,
          envVariables: envVars ? envVars.split(",").map((s) => s.trim()) : [],
          applicationUrl: `https://${subdomain}`,
        },
      });

      return config;
    });

    // Create Cloudflare DNS record after DB transaction
    if (cf && findVm.tunnelId) {
      try {
        await cf.createDNSRecord(id, findVm.tunnelId);
      } catch (err) {
        logger.error("Error creating DNS record", err as Error);
      }
    }

    ok(res, {
      message: "Deployment request sent successfully",
      id: txn.id,
      name: txn.name,
    });
  } catch (error) {
    logger.error("Error deploying image", error);
    fail(res, 500, "Internal server error", "DEPLOY_FAILED");
  }
});

depinVM.delete("/terminate/:id", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { publicKey: true },
  });
  if (!user) {
    fail(res, 404, "User not found");
    return;
  }

  const vmId = req.params.id;
  const vmInstance = await prisma.vMInstance.findFirst({
    where: { id: vmId, userId: req.userId },
    select: { id: true, VMImage: { select: { depinHostMachineId: true } } },
  });
  if (!vmInstance) {
    fail(res, 404, "VM instance not found");
    return;
  }
  const machineId = vmInstance.VMImage?.depinHostMachineId;
  if (!machineId) {
    fail(res, 400, "No host machine associated with this VM");
    return;
  }

  try {
    const token = signToken({ id: req.userId!, machineId }, "5Mins");
    wsSend({ type: "end-job", jobId: vmId, machineId, token });
    await prisma.$transaction(async (tx) => {
      await tx.vMInstance.update({
        where: { id: vmId },
        data: { status: "TERMINATED" },
      });
      await tx.depinHostMachine.update({
        where: { id: machineId },
        data: { isOccupied: false },
      });
    });

    // Enqueue settlement (3-way split on-chain)
    await terminateDepinVMQueue.add("terminate-depin-vm", {
      pubKey: user.publicKey,
      id: machineId,
    });

    // Delete Cloudflare DNS record
    const cf = getCF();
    if (cf) {
      try {
        await cf.deleteDNSRecord(vmId);
      } catch (err) {
        logger.error("Error deleting DNS record", err as Error);
      }
    }

    ok(res, { message: "Termination request sent successfully" });
  } catch (error) {
    logger.error("Error terminating VM", error);
    fail(res, 500, "Internal server error", "TERMINATE_FAILED");
  }
});

depinVM.post("/depinVerification", async (req, res) => {
  const parseData = DepinVerificationSchema.safeParse(req.body);
  if (!parseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  try {
    const { os, cpu_cores, ram_gb, disk_gb, ip_address, wallet, key } =
      parseData.data;
    const user = await prisma.user.findFirst({
      where: { publicKey: wallet },
      select: { name: true },
    });
    if (!user) {
      fail(res, 404, "User not found");
      return;
    }

    const vm = await prisma.depinHostMachine.findFirst({
      where: { ipAddress: ip_address },
      select: {
        id: true,
        Key: true,
        os: true,
        cpu: true,
        ram: true,
        diskSize: true,
        machineType: true,
        tunnelId: true,
      },
    });
    if (!vm) {
      fail(res, 404, "VM not found");
      return;
    }

    const isKeyValid = await bcrypt.compare(key, vm.Key);
    if (!isKeyValid) {
      fail(res, 400, "Invalid Key");
      return;
    }

    if (
      vm.os !== os ||
      Number(cpu_cores) < vm.cpu ||
      Number(ram_gb) < vm.ram ||
      Number(disk_gb) < vm.diskSize
    ) {
      await prisma.depinHostMachine.delete({ where: { id: vm.id } });
      fail(res, 400, "VM details do not match");
      return;
    }

    const pricePerHour = calculatePricePerHour(
      Number(cpu_cores),
      Number(ram_gb),
      Number(disk_gb),
    );
    await prisma.depinHostMachine.update({
      where: { id: vm.id },
      data: { verified: true, perHourPrice: pricePerHour },
    });
    await initialiseAccount.add("initialise-host-pda", {
      id: vm.id,
      hostName: user.name,
      machineType: vm.machineType,
      os: vm.os,
      diskSize: vm.diskSize,
      pricePerHour,
      userPubKey: wallet,
    });

    const token = signToken({ id: vm.id, userPublicKey: wallet });

    // Fetch tunnel token for cloudflared --token mode
    let tunnelToken: string | null = null;
    const cf = getCF();
    if (cf && vm.tunnelId) {
      try {
        const tokenRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${vm.tunnelId}/token`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN!}`,
            },
          },
        );
        const tokenBody = (await tokenRes.json()) as {
          success: boolean;
          result: string;
        };
        if (tokenBody.success) tunnelToken = tokenBody.result;
      } catch (err) {
        logger.error("Error fetching tunnel token", err as Error);
      }
    }

    ok(res, {
      message: "VM verified successfully",
      host_id: vm.id,
      token,
      tunnelToken,
      tunnelId: vm.tunnelId,
    });
  } catch (error) {
    logger.error("Error in depin verification", error);
    fail(res, 500, "Internal server error", "VERIFICATION_FAILED");
  }
});

depinVM.post("/register", authMiddleware, async (req, res) => {
  const ParseData = RegisterVMSchema.safeParse(req.body);
  if (!ParseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  try {
    const {
      machineType,
      ipAddress,
      cpu,
      ram,
      diskSize,
      region,
      userPublicKey,
      os,
      Key,
    } = ParseData.data;
    const vm = await prisma.depinHostMachine.create({
      data: {
        machineType,
        ipAddress,
        cpu,
        ram,
        diskSize,
        region,
        os,
        userPublicKey,
        Key: await bcrypt.hash(Key, 10),
      },
    });

    // Create Cloudflare tunnel for this host
    const cf = getCF();
    if (cf) {
      try {
        const tunnel = await cf.createTunnel(vm.id);
        await prisma.depinHostMachine.update({
          where: { id: vm.id },
          data: {
            tunnelId: tunnel.tunnelId,
            tunnelCredentials: JSON.stringify(tunnel.credentials),
          },
        });
      } catch (err) {
        logger.error("Error creating Cloudflare tunnel", err as Error);
      }
    }

    ok(res, { message: "VM registered successfully", vm });
  } catch (error) {
    logger.error("Error registering VM", error);
    fail(res, 500, "Internal server error", "REGISTER_FAILED");
  }
});

depinVM.post("/changeVisibility", authMiddleware, async (req, res) => {
  const parseData = ChangeVMStatusSchema.safeParse(req.body);
  if (!parseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  const { id, pubKey, status, Key } = parseData.data;
  try {
    const vm = await prisma.depinHostMachine.findFirst({
      where: { id, userPublicKey: pubKey },
      select: { id: true, Key: true },
    });
    if (!vm) {
      fail(res, 404, "VM not found");
      return;
    }

    const isKeyValid = await bcrypt.compare(Key, vm.Key);
    if (!isKeyValid) {
      fail(res, 400, "Invalid Key");
      return;
    }

    await prisma.depinHostMachine.update({
      where: { id, userPublicKey: pubKey },
      data: { isActive: status },
    });

    // Notify host agent via WS relayer
    try {
      const token = signToken({ id: req.userId!, machineId: id }, "5Mins");
      if (!status) {
        wsSend({ type: "end-job", jobId: "all", machineId: id, token });
      }
    } catch (e) {
      logger.error("WS send error", e as Error);
    }

    ok(res, { message: "VM visibility updated successfully" });
  } catch (error) {
    logger.error("Error fetching VM", error);
    fail(res, 500, "Internal server error", "VM_FETCH_FAILED");
  }
});

depinVM.get("/getAll", authMiddleware, async (req, res) => {
  const parsed = z
    .object({ userPublicKey: z.string().min(1) })
    .safeParse(req.query);
  if (!parsed.success) {
    fail(res, 400, "User public key is required");
    return;
  }
  const { userPublicKey } = parsed.data;

  try {
    const vms = await prisma.depinHostMachine.findMany({
      where: { userPublicKey },
    });
    ok(res, vms);
  } catch (error) {
    logger.error("Error fetching VMs", error);
    fail(res, 500, "Internal server error", "VMS_FETCH_FAILED");
  }
});

depinVM.get("/getById", authMiddleware, async (req, res) => {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(req.query);
  if (!parsed.success) {
    fail(res, 400, "VM ID is required");
    return;
  }
  const { id } = parsed.data;

  try {
    const vm = await prisma.depinHostMachine.findFirst({ where: { id } });
    if (!vm) {
      fail(res, 404, "VM not found");
      return;
    }
    ok(res, vm);
  } catch (error) {
    logger.error("Error fetching VM by ID", error);
    fail(res, 500, "Internal server error", "VM_BY_ID_FAILED");
  }
});

depinVM.post("/claimSOL", authMiddleware, async (req, res) => {
  const parseData = ClaimSOLSchema.safeParse(req.body);
  if (!parseData.success) {
    fail(res, 400, "Invalid request body");
    return;
  }

  try {
    const { id, pubKey } = parseData.data;
    const vm = await prisma.depinHostMachine.findFirst({
      where: { id, userPublicKey: pubKey },
    });
    if (!vm) {
      fail(res, 404, "VM not found");
      return;
    }
    if (vm.isActive) {
      fail(res, 400, "Cannot claim SOL while VM is active");
      return;
    }

    await claimRewardsQueue.add("claim-rewards", {
      id: vm.id,
      userPubKey: pubKey,
    });
    ok(res, { message: "Claim request submitted" });
  } catch (error) {
    logger.error("Error claiming SOL", error);
    fail(res, 500, "Internal server error", "CLAIM_SOL_FAILED");
  }
});

const MINUTE_MS = 60 * 1000;

depinVM.get("/settlement/:id", authMiddleware, async (req, res) => {
  const user = await getUserOr404(res, req.userId);
  if (!user) return;

  const vmId = req.params.id;
  try {
    const settlement = await prisma.depinSettlement.findFirst({
      where: { jobId: vmId },
    });
    ok(res, { settlement });
  } catch (error) {
    logger.error("Error fetching settlement", error);
    fail(res, 500, "Internal server error", "SETTLEMENT_FETCH_FAILED");
  }
});

export default depinVM;
