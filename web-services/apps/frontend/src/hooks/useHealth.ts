import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { HealthCheckResponse } from "@/types/health";

const POLL_INTERVAL = 30_000;

export function useHealth() {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    async function fetchHealth() {
      const start = performance.now();
      try {
        const res = await api.get("/health");
        setLatency(Math.round(performance.now() - start));
        setData(res.data as HealthCheckResponse);
        setError(false);
      } catch {
        setError(true);
        setData(null);
      }
    }
    fetchHealth();
    intervalRef.current = setInterval(fetchHealth, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  return { data, error, latency };
}
