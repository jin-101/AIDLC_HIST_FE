import { NextResponse } from "next/server";
import { fail } from "@/lib/api/response";
import { eventBus } from "@/server/events/event-bus";
import { formatSsePing } from "@/server/events/sse-format";

const KEEPALIVE_MS = 15_000;

export async function GET(request: Request): Promise<Response> {
  const storeId = new URL(request.url).searchParams.get("storeId")?.trim();
  if (!storeId) {
    return NextResponse.json(fail("VALIDATION_ERROR", "storeId가 필요합니다."), { status: 400 });
  }

  const encoder = new TextEncoder();
  let clientId: string | null = null;
  let keepalive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (frame: string) => controller.enqueue(encoder.encode(frame));
      const registration = eventBus.subscribe(storeId, { send });
      clientId = registration.clientId;

      send(formatSsePing());
      keepalive = setInterval(() => {
        try {
          send(formatSsePing());
        } catch {
          cleanup();
        }
      }, KEEPALIVE_MS);

      request.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup();
    }
  });

  function cleanup() {
    if (keepalive) {
      clearInterval(keepalive);
      keepalive = null;
    }
    if (clientId) {
      eventBus.unsubscribe(clientId);
      clientId = null;
    }
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
