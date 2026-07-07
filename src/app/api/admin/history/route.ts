import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { historyRepository } from "@/server/repositories/history-repository";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const params = new URL(request.url).searchParams;
    const tableId = params.get("tableId")?.trim();
    if (!tableId) throw validationError("tableId가 필요합니다.");

    return NextResponse.json(ok({
      orders: historyRepository.listByTableAndDate({
        tableId,
        dateFrom: params.get("dateFrom") ?? undefined,
        dateTo: params.get("dateTo") ?? undefined
      })
    }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
