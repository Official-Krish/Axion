import { Worker } from "bullmq";
import prisma from "@axion/db";
import { logger } from "@axion/utilities";
import { redisConnection as connection } from "@axion/utilities/redis";

const HEALTH_PORT = Number(process.env.HEALTH_PORT || "9094");

Bun.serve({
  port: HEALTH_PORT,
  fetch(req) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    }
    return new Response("Not found", { status: 404 });
  },
});

const projectId = process.env.PROJECT_ID;
const PLATFORM_VAULT_PUBKEY = process.env.PLATFORM_VAULT_PUBKEY || "";
const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS || "1000");

const WS_URL = process.env.WS_URL || "ws://localhost:8080";

let ws: WebSocket | undefined;
let contractModulePromise: Promise<typeof import("./contract")> | undefined;

function getContractModule() {
  contractModulePromise ??= import("./contract");
  return contractModulePromise;
}

function getWebSocket() {
  ws ??= new WebSocket(WS_URL);
  return ws;
}

const worker = new Worker(
  "vm-termination",
  async (job) => {
    const { endRentalSession } = await getContractModule();
    logger.info(`Processing job ${job.id} for VM instance`, {
      vmId: job.data.vmId,
    });
    const { instanceId, zone, pubKey, isEscrow, id } = job.data;
    const vmInstance = await prisma.vMInstance.findFirst({
      where: { id, instanceId },
    });
    if (!vmInstance) {
      throw new Error(`VM instance not found: ${id}`);
    }
    const txn = await endRentalSession(vmInstance.id, pubKey, isEscrow);
    if (!txn) {
      throw new Error(`Failed to end rental session for ${instanceId}`);
    }
    const operationDone = await deleteInstance(zone, instanceId);
    if (!operationDone) {
      throw new Error(`Failed to delete VM instance ${instanceId}`);
    }
    await prisma.vMInstance.update({
      where: { id, instanceId },
      data: { status: "DELETED" },
    });
    logger.info(`VM instance ${instanceId} deleted and rental session ended`);
  },
  { connection, concurrency: 1 },
);

worker.on("completed", (job) => {
  logger.info(`Job completed: ${job.data.instanceId}`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed`, err);
});

const DepinWorker = new Worker(
  "initialise-host-pda",
  async (job) => {
    const { InitialiseHostPDA } = await getContractModule();
    const {
      id,
      hostName,
      machineType,
      os,
      diskSize,
      pricePerHour,
      userPubKey,
    } = job.data;
    const tx = await InitialiseHostPDA(
      id,
      hostName,
      machineType,
      os,
      diskSize,
      pricePerHour,
      userPubKey,
    );
    if (!tx) {
      throw new Error(`Failed to initialise host PDA for job ${job.id}`);
    }
    logger.info(`Host PDA initialised for job ${job.id}`, { tx });
    await prisma.depinHostMachine.update({
      where: { id },
      data: { pdaAddress: tx.hostMachinePda.toBase58() },
    });
  },
  { connection, concurrency: 1 },
);

DepinWorker.on("completed", (job) => {
  logger.info(`Depin job completed: ${job.id}`);
});
DepinWorker.on("failed", (job, err) => {
  logger.error(`Depin job ${job?.id} failed`, err);
});

const changeVmStatus = new Worker(
  "changeVMStatus",
  async (job) => {
    const { activateHost, deActivateHost } = await getContractModule();
    const { id, userPubKey, status } = job.data;
    if (status === false) {
      await deActivateHost(id, userPubKey);
    } else if (status === true) {
      await activateHost(id, userPubKey);
    }
    logger.info(`Status change processed for ${id}`, { status });
  },
  { connection, concurrency: 1 },
);

changeVmStatus.on("completed", (job) => {
  logger.info(`Status change completed: ${job.id}`);
});
changeVmStatus.on("failed", (job, err) => {
  logger.error(`Status change job ${job?.id} failed`, err);
});

const terminateDepinVm = new Worker(
  "terminate-depin-vm",
  async (job) => {
    const { settleDepinJob } = await getContractModule();
    const { pubKey, id } = job.data;
    const findVm = await prisma.depinHostMachine.findFirst({
      where: { id },
      include: { VMImage: true },
    });
    if (!findVm) {
      throw new Error(`No VM found with ID ${id}`);
    }

    const vmInstance = await prisma.vMInstance.findFirst({
      where: { id: findVm.VMImage?.id },
    });

    if (
      vmInstance &&
      vmInstance.status !== "DEPLOYING" &&
      vmInstance.status !== "RUNNING" &&
      vmInstance.status !== "BOOTING"
    ) {
      logger.info(
        `VM ${vmInstance.id} already in state ${vmInstance.status}, skipping settlement`,
      );
      return;
    }

    getWebSocket().send(
      JSON.stringify({
        type: "end-job",
        machineId: findVm.id,
        jobId: findVm.VMImage?.id,
      }),
    );

    if (vmInstance) {
      const uptimeMs = Date.now() - new Date(vmInstance.startTime).getTime();
      const uptimeHours = uptimeMs / (1000 * 60 * 60);
      const hostEarned = Math.floor(uptimeHours * findVm.perHourPrice * 1e9);
      const totalMs =
        new Date(vmInstance.endTime).getTime() -
        new Date(vmInstance.startTime).getTime();

      const tx = await settleDepinJob(
        vmInstance.id,
        pubKey,
        findVm.userPublicKey,
        hostEarned,
        PLATFORM_FEE_BPS,
        PLATFORM_VAULT_PUBKEY,
      );

      const platformFee = (hostEarned * PLATFORM_FEE_BPS) / 10000;
      const hostPayout = hostEarned - platformFee;
      const escrowLamports = vmInstance.price * 1e9;
      const renterRefund = Math.max(0, escrowLamports - hostEarned);

      await prisma.depinSettlement.create({
        data: {
          hostMachineId: findVm.id,
          renterPubKey: pubKey,
          jobId: vmInstance.id,
          hostEarned: hostPayout / 1e9,
          platformFee: platformFee / 1e9,
          renterRefund: renterRefund / 1e9,
          uptimeSeconds: Math.floor(uptimeMs / 1000),
          totalSeconds: Math.floor(totalMs / 1000),
          txSignature: tx,
        },
      });

      await prisma.vMInstance.update({
        where: { id: vmInstance.id },
        data: { status: "DELETED" },
      });
    }

    await prisma.depinHostMachine.update({
      where: { id: findVm.id },
      data: { isOccupied: false },
    });

    logger.info(`DePIN job ${id} settled successfully`);
  },
  { connection, concurrency: 1 },
);

terminateDepinVm.on("completed", (job) => {
  logger.info(`Terminate depin VM completed: ${job.id}`);
});
terminateDepinVm.on("failed", (job, err) => {
  logger.error(`Terminate depin VM ${job?.id} failed`, err);
});

let computeClient: InstanceType<any> | null = null;

async function getInstancesClient() {
  if (!computeClient) {
    const { default: compute } = await import("@google-cloud/compute");
    computeClient = new compute.InstancesClient();
  }
  return computeClient;
}

async function deleteInstance(zone: string, instanceId: string) {
  const client = await getInstancesClient();
  await client.delete({
    project: projectId,
    zone,
    instance: instanceId,
  });
  return true;
}

const claimRewardsWorker = new Worker(
  "claim-rewards",
  async (job) => {
    const { claimRewards } = await getContractModule();
    const { id, userPubKey } = job.data;
    const tx = await claimRewards(id, userPubKey);
    if (!tx) {
      throw new Error(`Failed to claim rewards for ${id}`);
    }
    logger.info(`Rewards claimed for ${id}`, { tx });
  },
  { connection, concurrency: 1 },
);

claimRewardsWorker.on("completed", (job) => {
  logger.info(`Claim rewards completed: ${job.id}`);
});
claimRewardsWorker.on("failed", (job, err) => {
  logger.error(`Claim rewards ${job?.id} failed`, err);
});

const penalizeHostWorker = new Worker(
  "penalize-host",
  async (job) => {
    const { penalizeHost } = await getContractModule();
    const { id, userPubKey } = job.data;
    const tx = await penalizeHost(id, userPubKey);
    if (!tx) {
      throw new Error(`Failed to penalize host ${id}`);
    }
    logger.info(`Host ${id} penalized`, { tx });
  },
  { connection, concurrency: 1 },
);

penalizeHostWorker.on("completed", (job) => {
  logger.info(`Penalize host completed: ${job.id}`);
});
penalizeHostWorker.on("failed", (job, err) => {
  logger.error(`Penalize host ${job?.id} failed`, err);
});
