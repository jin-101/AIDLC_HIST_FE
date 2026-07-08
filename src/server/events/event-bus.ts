import { v4 as uuid } from "uuid";
import type { RealtimeEvent } from "@/features/realtime/types";
import { formatSseData } from "./sse-format";

export interface EventClient {
  clientId?: string;
  storeId?: string;
  connectedAt?: string;
  send: (frame: string) => void;
}

export interface EventClientRegistration {
  clientId: string;
  storeId: string;
  connectedAt: string;
  send: (frame: string) => void;
}

export interface PublishResult {
  delivered: number;
  removed: number;
}

const clientsByStore = new Map<string, Map<string, EventClientRegistration>>();
const clientStoreIndex = new Map<string, string>();

function bucketFor(storeId: string): Map<string, EventClientRegistration> {
  const existing = clientsByStore.get(storeId);
  if (existing) return existing;
  const next = new Map<string, EventClientRegistration>();
  clientsByStore.set(storeId, next);
  return next;
}

export const eventBus = {
  subscribe(storeId: string, client: EventClient): EventClientRegistration {
    const normalizedStoreId = storeId.trim();
    if (!normalizedStoreId) throw new Error("storeId is required for SSE subscription.");

    const registration: EventClientRegistration = {
      clientId: client.clientId ?? uuid(),
      storeId: normalizedStoreId,
      connectedAt: client.connectedAt ?? new Date().toISOString(),
      send: client.send
    };

    bucketFor(normalizedStoreId).set(registration.clientId, registration);
    clientStoreIndex.set(registration.clientId, normalizedStoreId);
    return registration;
  },

  unsubscribe(clientId: string): void {
    const storeId = clientStoreIndex.get(clientId);
    if (!storeId) return;
    const bucket = clientsByStore.get(storeId);
    bucket?.delete(clientId);
    if (bucket?.size === 0) clientsByStore.delete(storeId);
    clientStoreIndex.delete(clientId);
  },

  publish(event: RealtimeEvent): PublishResult {
    const bucket = clientsByStore.get(event.storeId);
    if (!bucket) return { delivered: 0, removed: 0 };

    let delivered = 0;
    let removed = 0;
    const frame = formatSseData(event);

    for (const client of [...bucket.values()]) {
      try {
        client.send(frame);
        delivered += 1;
      } catch {
        this.unsubscribe(client.clientId);
        removed += 1;
      }
    }

    return { delivered, removed };
  },

  sizeForStore(storeId: string): number {
    return clientsByStore.get(storeId)?.size ?? 0;
  },

  clear(): void {
    clientsByStore.clear();
    clientStoreIndex.clear();
  }
};
