import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { toApiFailure, validationError } from "@/lib/api/errors";
import { menuRepository, type MenuInput } from "@/server/repositories/menu-repository";

interface MenuMutationRequest extends Partial<MenuInput> {
  id?: unknown;
}

function parseMenuInput(body: MenuMutationRequest): MenuInput {
  const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const price = Number(body.price);
  const displayOrder = Number(body.displayOrder);

  if (!storeId || !categoryId || !name || !Number.isInteger(price) || price <= 0 || !Number.isInteger(displayOrder)) {
    throw validationError("메뉴 입력값을 확인해주세요.");
  }

  return { storeId, categoryId, name, description, price, displayOrder };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId")?.trim();
    if (!storeId) throw validationError("storeId가 필요합니다.");

    return NextResponse.json(ok({
      categories: menuRepository.listCategoriesByStore(storeId),
      items: menuRepository.listByStore(storeId)
    }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const item = menuRepository.create(parseMenuInput((await request.json()) as MenuMutationRequest));
    return NextResponse.json(ok({ item }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MenuMutationRequest;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) throw validationError("menu item id가 필요합니다.");
    const input = parseMenuInput(body);
    const item = menuRepository.update(id, {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      displayOrder: input.displayOrder
    });
    if (!item) throw validationError("메뉴를 찾을 수 없습니다.");
    return NextResponse.json(ok({ item }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MenuMutationRequest;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) throw validationError("menu item id가 필요합니다.");
    menuRepository.delete(id);
    return NextResponse.json(ok({ deleted: true }));
  } catch (error) {
    return NextResponse.json(toApiFailure(error), { status: 400 });
  }
}
