import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

export type WSConnectionState = "disconnected" | "connecting" | "connected";

// ── Singleton WS state ────────────────────────────────────────────────
let globalWs: WebSocket | null = null;
const listeners = new Set<EventHandler>();
const subscribedPubkeys = new Set<string>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;

// ── Connection state tracking ─────────────────────────────────────────
let _connectionState: WSConnectionState = "disconnected";
const stateListeners = new Set<() => void>();

function getConnectionState(): WSConnectionState {
  return _connectionState;
}

function setConnectionState(state: WSConnectionState) {
  _connectionState = state;
  stateListeners.forEach((fn) => fn());
}

function subscribeToState(cb: () => void) {
  stateListeners.add(cb);
  return () => stateListeners.delete(cb);
}

export function useWSConnectionStatus(): WSConnectionState {
  return useSyncExternalStore(subscribeToState, getConnectionState);
}

export { connect as connectWs };

// ── Backoff ───────────────────────────────────────────────────────────
const BACKOFF_BASE = 1000;
const BACKOFF_MAX = 30000;

function scheduleReconnect() {
  const delay = Math.min(
    BACKOFF_BASE * Math.pow(2, reconnectAttempt),
    BACKOFF_MAX,
  );
  reconnectAttempt++;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, delay);
}

function sendSubscribe(pubkey: string) {
  if (globalWs?.readyState === WebSocket.OPEN) {
    globalWs.send(JSON.stringify({ type: "subscribe-indexer", pubkey }));
  }
}

function connect() {
  if (globalWs?.readyState === WebSocket.OPEN) return;
  if (globalWs?.readyState === WebSocket.CONNECTING) return;

  setConnectionState("connecting");

  globalWs = new WebSocket(WS_RELAYER_URL);

  globalWs.onopen = () => {
    reconnectAttempt = 0;
    setConnectionState("connected");
    for (const pk of subscribedPubkeys) sendSubscribe(pk);
  };

  globalWs.onmessage = (msg) => {
    try {
      const parsed = JSON.parse(msg.data as string);
      if (parsed.type === "indexer-event" && parsed.data) {
        listeners.forEach((fn) => fn(parsed.data));
      } else {
        console.warn("[ws-indexer] unknown message:", parsed);
      }
    } catch {
      console.error("[ws-indexer] failed to parse message:", msg.data);
    }
  };

  globalWs.onclose = () => {
    globalWs = null;
    setConnectionState("disconnected");
    scheduleReconnect();
  };

  globalWs.onerror = () => {
    globalWs?.close();
  };
}

function addPubkey(pubkey: string) {
  subscribedPubkeys.add(pubkey);
  if (globalWs?.readyState === WebSocket.OPEN) {
    sendSubscribe(pubkey);
  } else if (globalWs?.readyState === WebSocket.CONNECTING) {
    // onopen will subscribe all pubkeys in the set — nothing to do
  } else {
    connect();
  }
}

function removePubkey(pubkey: string) {
  subscribedPubkeys.delete(pubkey);
}

function disconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (globalWs?.readyState === WebSocket.CONNECTING) {
    return;
  }
  globalWs?.close();
  globalWs = null;
  subscribedPubkeys.clear();
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useIndexerEvents(opts?: {
  instruction?: string;
  account?: string;
  onEvent?: EventHandler;
}) {
  const [lastEvent, setLastEvent] = useState<IndexerEvent | null>(null);
  const onEventRef = useRef(opts?.onEvent);
  onEventRef.current = opts?.onEvent;

  useEffect(() => {
    // Don't connect until we have a pubkey to subscribe with
    if (opts?.account) addPubkey(opts.account);
    else return; // wallet not ready yet — effect will re-run when account arrives

    const handler: EventHandler = (event) => {
      if (opts?.instruction && event.instruction !== opts.instruction) return;
      setLastEvent(event);
      onEventRef.current?.(event);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      if (opts?.account) {
        removePubkey(opts.account);
        if (listeners.size === 0 && subscribedPubkeys.size === 0) disconnect();
      }
    };
  }, [opts?.instruction, opts?.account]);

  return lastEvent;
}

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
      if (event.args?.id === vmId) {
        setStatus(event.success ? "confirmed" : "failed");
      }
    },
  });

  return status;
}
