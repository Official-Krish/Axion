import { api } from "./api";

export const calculatePrice = async (
  machineType: string,
  diskSize: number,
  duration: number,
): Promise<number> => {
  try {
    const response = await api.get("/vm/calculatePrice", {
      params: { machineType, diskSize },
    });
    const price = response.data.price;
    const perDayPrice = price / 30;
    const Inhours = perDayPrice / (24 * 60);
    return Inhours * duration;
  } catch {
    return 0;
  }
};

export function getVmDetails(machineType: string): {
  cpu: number;
  ram: number;
} {
  switch (machineType) {
    case "e2-micro":
      return { cpu: 1, ram: 1 };
    case "e2-small":
      return { cpu: 1, ram: 2 };
    case "e2-medium":
      return { cpu: 2, ram: 4 };
    case "e2-standard-2":
      return { cpu: 2, ram: 8 };
    case "e2-standard-4":
      return { cpu: 4, ram: 16 };
    case "e2-highmem-2":
      return { cpu: 2, ram: 16 };
    case "e2-highcpu-2":
      return { cpu: 2, ram: 2 };
    default:
      return { cpu: 0, ram: 0 };
  }
}

export async function calculateEscrowEndTime(
  escrowAmount: number,
  machineType: string,
  diskSize: number,
): Promise<number> {
  const minCost = (await calculatePrice(machineType, diskSize, 1)).toFixed(6);
  return escrowAmount / Number(minCost);
}
