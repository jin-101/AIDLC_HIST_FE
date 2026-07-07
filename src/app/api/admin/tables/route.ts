import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { tableRepository } from "@/server/repositories/table-repository";

interface UpsertTableRequest {
  storeId?: unknown;
  number?: unknown;
  password?: unknown;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId")?.trim();
    if (!storeId) throw validationError("storeId가 필요합니다.");

    return NextResponse.json(ok({ tables: tableRepository.listByStore(storeId) }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as UpsertTableRequest;
    const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
    const number = typeof body.number === "string" ? body.number.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!storeId || !number || !password) throw validationError("테이블 번호와 비밀번호를 입력해주세요.");

    return NextResponse.json(ok({ table: tableRepository.upsertTable({ storeId, number, password }) }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
