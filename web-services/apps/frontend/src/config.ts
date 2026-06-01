import { PublicKey } from "@solana/web3.js";
import { runtimeEnv } from "./runtimeEnv";

export const BACKEND_URL =
  runtimeEnv.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000/api/v2";
export const ADMIN_KEY =
  runtimeEnv.VITE_ADMIN_KEY || import.meta.env.VITE_ADMIN_KEY || "";
export const WS_RELAYER_URL =
  runtimeEnv.VITE_WS_RELAYER_URL ||
  import.meta.env.VITE_WS_RELAYER_URL ||
  "ws://localhost:9093";
export const SOLANA_RPC_URL =
  runtimeEnv.VITE_SOLANA_RPC_URL ||
  import.meta.env.VITE_SOLANA_RPC_URL ||
  "http://localhost:8899";

export const getAdminPublicKey = (): PublicKey => {
  if (!ADMIN_KEY) {
    throw new Error(
      "VITE_ADMIN_KEY is missing. Set it to a valid Solana public key.",
    );
  }

  try {
    return new PublicKey(ADMIN_KEY);
  } catch {
    throw new Error("VITE_ADMIN_KEY must be a valid Solana public key.");
  }
};
