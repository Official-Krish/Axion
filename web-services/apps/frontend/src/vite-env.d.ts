/// <reference types="vite/client" />

interface Window {
  __AXION_ENV__?: {
    VITE_BACKEND_URL?: string;
    VITE_ADMIN_KEY?: string;
    VITE_WS_RELAYER_URL?: string;
    VITE_SOLANA_RPC_URL?: string;
  };
}
