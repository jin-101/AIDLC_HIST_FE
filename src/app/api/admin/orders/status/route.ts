import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import type { OrderStatus } from "@/lib/types/domain";
import { orderRepository } from "@/server/repositories/order-repository";

const allowedStatuses: OrderStatus[] = ["waiting", "preparing", "completed"];

interface StatusRequest {
  orderId?: unknown;
  status?: unknown;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as StatusRequest;
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!orderId || !allowedStatuses.includes(status as OrderStatus)) {
      throw validationError("주문 상태 변경 정보를 확인해주세요.");
    }

    const order = orderRepository.updateStatus(orderId, status as OrderStatus);
    if (!order) throw validationError("주문을 찾을 수 없습니다.");

    return NextResponse.json(ok({ order }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
