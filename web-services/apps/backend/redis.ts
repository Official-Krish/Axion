import { createQueue } from "@axion/utilities/redis";

const DEFAULT_RETRY = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 2000 },
};

export const vmQueue = createQueue("vm-termination", {
  defaultJobOptions: DEFAULT_RETRY,
});
export const terminateDepinVMQueue = createQueue("terminate-depin-vm", {
  defaultJobOptions: DEFAULT_RETRY,
});
export const activateHostQueue = createQueue("changeVMStatus", {
  defaultJobOptions: DEFAULT_RETRY,
});
export const initialiseAccount = createQueue("initialise-host-pda", {
  defaultJobOptions: DEFAULT_RETRY,
});
export const claimRewardsQueue = createQueue("claim-rewards", {
  defaultJobOptions: DEFAULT_RETRY,
});
