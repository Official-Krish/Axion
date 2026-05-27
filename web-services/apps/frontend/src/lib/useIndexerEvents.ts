import { useEffect, useRef, useState } from "react";
import { WS_RELAYER_URL } from "@/config";

export interface IndexerEvent {
  instruction: string;
  signature: string;
  accounts: string[];
  args: Record<string, string | number> | null;
  success: boolean;
  slot: number;
}

type EventHandler = (event: IndexerEvent) => void;

let globalWs: WebSocket | null = null;
const listeners: Set<EventHandler> = new Set();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscribedPubkey: string | null = null;

function connect(pubkey?: string) {
  if (globalWs?.readyState === WebSocket.OPEN) {
    // Already connected, just subscribe if pubkey changed
    if (pubkey && pubkey !== subscribedPubkey) {
      subscribePubkey(pubkey);
    }
    return;
  }

  globalWs = new WebSocket(WS_RELAYER_URL);

  globalWs.onopen = () => {
    if (pubkey) subscribePubkey(pubkey);
  };

  globalWs.onmessage = (msg) => {
    try {
      const parsed = JSON.parse(msg.data);
      if (parsed.type === "indexer-event" && parsed.data) {
        listeners.forEach((fn) => fn(parsed.data));
      }
    } catch {
      // ignore malformed messages
    }
  };

  globalWs.onclose = () => {
    subscribedPubkey = null;
    reconnectTimer = setTimeout(() => connect(pubkey), 3000);
  };

  globalWs.onerror = () => {
    globalWs?.close();
  };
}

function subscribePubkey(pubkey: string) {
  if (globalWs?.readyState === WebSocket.OPEN) {
    globalWs.send(JSON.stringify({ type: "subscribe-indexer", pubkey }));
    subscribedPubkey = pubkey;
  }
}

function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  globalWs?.close();
  globalWs = null;
  subscribedPubkey = null;
}

/**
 * Hook to subscribe to real-time indexer events from the ws-relayer.
 * Pass `account` (user's wallet pubkey) to receive only relevant events.
 */
export function useIndexerEvents(opts?: {
  instruction?: string;
  account?: string;
  onEvent?: EventHandler;
}) {
  const [lastEvent, setLastEvent] = useState<IndexerEvent | null>(null);
  const onEventRef = useRef(opts?.onEvent);
  onEventRef.current = opts?.onEvent;

  useEffect(() => {
    connect(opts?.account);

    const handler: EventHandler = (event) => {
      if (opts?.instruction && event.instruction !== opts.instruction) return;
      setLastEvent(event);
      onEventRef.current?.(event);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      if (listeners.size === 0) disconnect();
    };
  }, [opts?.instruction, opts?.account]);

  return lastEvent;
}

/**
 * Hook to listen for a specific transaction confirmation by VM id.
 * Returns "pending" | "confirmed" | "failed"
 */
export function usePaymentConfirmation(
  vmId: string | null,
  expectedInstruction?: string,
) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );

  useIndexerEvents({
    instruction: expectedInstruction,
    onEvent: (event) => {
      if (!vmId) return;
      const eventId = event.args?.id;
      if (eventId === vmId) {
        setStatus(event.success ? "confirmed" : "failed");
      }
    },
  });

  return status;
}
