import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { sessionRepository } from "@/server/repositories/session-repository";
import type { TableCompletionResult } from "@/features/admin/types";

interface CompleteRequest {
  tableId?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CompleteRequest;
    const tableId = typeof body.tableId === "string" ? body.tableId.trim() : "";
    if (!tableId) throw validationError("tableId가 필요합니다.");

    const activeSession = sessionRepository.findActiveByTable(tableId);
    if (!activeSession) throw validationError("활성 테이블 세션이 없습니다.");

    const completed = sessionRepository.complete(activeSession.id);
    if (!completed || !completed.completedAt) throw validationError("테이블 이용 완료에 실패했습니다.");

    const result: TableCompletionResult = {
      tableId,
      sessionId: completed.id,
      completedAt: completed.completedAt
    };

    return NextResponse.json(ok(result));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
