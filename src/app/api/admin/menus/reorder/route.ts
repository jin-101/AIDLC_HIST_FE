import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { menuRepository } from "@/server/repositories/menu-repository";

interface ReorderRequest {
  orderedIds?: unknown;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ReorderRequest;
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.filter((id): id is string => typeof id === "string") : [];
    if (orderedIds.length === 0 || new Set(orderedIds).size !== orderedIds.length) {
      throw validationError("메뉴 순서 정보를 확인해주세요.");
    }

    return NextResponse.json(ok({ items: menuRepository.reorder(orderedIds) }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
