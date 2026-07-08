import type { RealtimeEvent } from "@/features/realtime/types";

export function formatSseData(event: RealtimeEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function formatSsePing(): string {
  return ": ping\n\n";
}
