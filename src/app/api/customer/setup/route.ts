import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { sessionRepository } from "@/server/repositories/session-repository";
import { storeRepository } from "@/server/repositories/store-repository";
import { tableRepository } from "@/server/repositories/table-repository";
import type { TableContext } from "@/features/customer/types";

interface SetupRequest {
  storeCode?: unknown;
  tableNumber?: unknown;
  tablePassword?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SetupRequest;
    const storeCode = typeof body.storeCode === "string" ? body.storeCode.trim() : "";
    const tableNumber = typeof body.tableNumber === "string" ? body.tableNumber.trim() : "";
    const tablePassword = typeof body.tablePassword === "string" ? body.tablePassword : "";

    if (!storeCode || !tableNumber || !tablePassword) {
      throw validationError("매장 코드, 테이블 번호, 테이블 비밀번호를 입력해주세요.");
    }

    const store = storeRepository.findByCode(storeCode);
    if (!store) {
      throw validationError("매장 정보를 찾을 수 없습니다.");
    }

    const table = tableRepository.findByStoreAndNumber(store.id, tableNumber);
    if (!table || table.password !== tablePassword) {
      throw validationError("테이블 정보를 확인해주세요.");
    }

    const session = sessionRepository.findActiveByTable(table.id) ?? sessionRepository.create({
      storeId: store.id,
      tableId: table.id
    });

    const context: TableContext = {
      storeId: store.id,
      storeCode: store.code,
      tableId: table.id,
      tableNumber: table.number,
      sessionId: session.id,
      savedAt: new Date().toISOString()
    };

    return NextResponse.json(ok(context));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
