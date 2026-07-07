import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { orderRepository } from "@/server/repositories/order-repository";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId")?.trim();
    if (!storeId) throw validationError("storeId가 필요합니다.");

    return NextResponse.json(ok({ dashboard: orderRepository.dashboardByStore(storeId) }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
