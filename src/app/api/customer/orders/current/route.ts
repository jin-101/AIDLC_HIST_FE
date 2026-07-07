import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { orderRepository } from "@/server/repositories/order-repository";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId")?.trim();
    if (!sessionId) {
      throw validationError("sessionId가 필요합니다.");
    }

    return NextResponse.json(ok({ orders: orderRepository.listBySession(sessionId) }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
