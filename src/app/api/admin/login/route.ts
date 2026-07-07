import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { adminCredentialRepository } from "@/server/repositories/admin-credential-repository";
import { storeRepository } from "@/server/repositories/store-repository";
import type { AdminSession } from "@/features/admin/types";

interface LoginRequest {
  storeCode?: unknown;
  password?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequest;
    const storeCode = typeof body.storeCode === "string" ? body.storeCode.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!storeCode || !password) {
      throw validationError("매장 코드와 관리자 비밀번호를 입력해주세요.");
    }

    const store = storeRepository.findByCode(storeCode);
    if (!store) {
      throw validationError("관리자 정보를 확인해주세요.");
    }

    const credential = adminCredentialRepository.findByStore(store.id);
    if (!credential || credential.password !== password) {
      throw validationError("관리자 정보를 확인해주세요.");
    }

    const session: AdminSession = {
      storeId: store.id,
      storeCode: store.code,
      storeName: store.name,
      loggedIn: true,
      savedAt: new Date().toISOString()
    };

    return NextResponse.json(ok(session));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
