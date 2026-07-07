import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { menuRepository } from "@/server/repositories/menu-repository";
import { storeRepository } from "@/server/repositories/store-repository";
import type { MenuCatalog } from "@/features/customer/types";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("storeId")?.trim();
    if (!storeId) {
      throw validationError("storeId가 필요합니다.");
    }

    const store = storeRepository.findById(storeId);
    if (!store) {
      throw validationError("매장 정보를 찾을 수 없습니다.");
    }

    const catalog: MenuCatalog = {
      categories: menuRepository.listCategoriesByStore(storeId),
      items: menuRepository.listByStore(storeId)
    };

    return NextResponse.json(ok(catalog));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
