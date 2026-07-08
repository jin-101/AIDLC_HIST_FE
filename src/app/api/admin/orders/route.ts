import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { orderRepository } from "@/server/repositories/order-repository";
import { publishOrderDeleted } from "@/server/events/event-publisher";

interface DeleteOrderRequest {
  orderId?: unknown;
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as DeleteOrderRequest;
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) throw validationError("orderId가 필요합니다.");

    const order = orderRepository.findById(orderId);
    if (!order) throw validationError("주문을 찾을 수 없습니다.");
    orderRepository.delete(orderId);
    publishOrderDeleted(order);
    return NextResponse.json(ok({ deleted: true }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
