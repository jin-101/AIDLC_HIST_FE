import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import type { CreateOrderInput } from "@/lib/types/domain";
import { orderRepository } from "@/server/repositories/order-repository";
import { publishOrderCreated } from "@/server/events/event-publisher";
import type { OrderDraft, SubmitResult } from "@/features/customer/types";

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function toCreateOrderInput(draft: OrderDraft): CreateOrderInput {
  if (!draft.storeId || !draft.tableId || !draft.sessionId || draft.items.length === 0) {
    throw validationError("주문할 항목을 확인해주세요.");
  }

  const items = draft.items.map((item) => {
    if (!item.menuItemId || !item.menuName || !isPositiveInteger(item.quantity) || !isPositiveInteger(item.unitPrice)) {
      throw validationError("주문 항목이 올바르지 않습니다.");
    }

    return {
      menuItemId: item.menuItemId,
      menuName: item.menuName,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    };
  });

  return {
    storeId: draft.storeId,
    tableId: draft.tableId,
    sessionId: draft.sessionId,
    items
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const draft = (await request.json()) as OrderDraft;
    const order = orderRepository.createWithItems(toCreateOrderInput(draft));
    publishOrderCreated(order);
    const result: SubmitResult = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    };

    return NextResponse.json(ok(result));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
