import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { orderRepository } from "@/server/repositories/order-repository";

interface DeleteOrderRequest {
  orderId?: unknown;
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as DeleteOrderRequest;
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) throw validationError("orderId가 필요합니다.");

    orderRepository.delete(orderId);
    return NextResponse.json(ok({ deleted: true }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
