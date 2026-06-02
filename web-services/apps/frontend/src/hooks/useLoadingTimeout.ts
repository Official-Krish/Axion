import { useEffect, useState } from "react";

export function useLoadingTimeout(loading: boolean, timeoutMs = 30000) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(id);
  }, [loading, timeoutMs]);

  return timedOut;
}
