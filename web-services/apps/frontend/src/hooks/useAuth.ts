import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const wallet = useWallet();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthenticated = !!(wallet.connected && token);

  const publicKey = wallet.publicKey ?? null;

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "/";
  }, []);

  return useMemo(
    () => ({ isAuthenticated, publicKey, token, wallet, signOut }),
    [isAuthenticated, publicKey, token, wallet, signOut],
  );
}
