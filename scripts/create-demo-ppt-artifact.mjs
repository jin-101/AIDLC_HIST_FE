import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "reports", "demo-presentation");
const screenshotDir = path.join(outDir, "screenshots");
const qaDir = path.join(outDir, "qa");
const pptxPath = path.join(outDir, "table-order-demo-google-slides.pptx");
const artifactToolModule =
  process.env.ARTIFACT_TOOL_MODULE ??
  "/private/tmp/table-order-presentation-fix/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const slides = [
  {
    title: "Table Order MVP",
    subtitle: "고객 주문과 관리자 운영을 한 흐름에서 확인하는 테이블 주문 프로토타입",
    file: "01-home.png",
    note: "첫 화면에서 고객 주문과 관리자 운영 진입점을 분리합니다.",
  },
  {
    title: "고객 테이블 설정",
    subtitle: "매장 코드와 테이블 비밀번호로 고객의 주문 세션을 시작합니다.",
    file: "02-customer-setup.png",
    note: "데모 입력값은 demo-store, 1번 테이블, table-1입니다.",
  },
  {
    title: "고객 메뉴 탐색",
    subtitle: "카테고리별 메뉴를 확인하고 장바구니에 담습니다.",
    file: "03-customer-menu.png",
    note: "메뉴 seed data로 식사, 음료, 사이드 카테고리를 제공합니다.",
  },
  {
    title: "고객 장바구니",
    subtitle: "수량 조정과 총액 확인 후 주문을 제출합니다.",
    file: "04-customer-cart.png",
    note: "장바구니 총액은 line total 합과 일치하도록 검증됩니다.",
  },
  {
    title: "고객 주문 내역",
    subtitle: "현재 테이블 세션에서 제출한 주문을 확인합니다.",
    file: "05-customer-orders.png",
    note: "주문 제출 후 현재 세션 주문 목록이 표시됩니다.",
  },
  {
    title: "관리자 로그인",
    subtitle: "데모 관리자 계정으로 운영 화면에 접근합니다.",
    file: "06-admin-login.png",
    note: "데모 입력값은 demo-store, admin입니다.",
  },
  {
    title: "관리자 대시보드",
    subtitle: "테이블별 실시간 주문 현황과 주문 상태를 관리합니다.",
    file: "07-admin-dashboard.png",
    note: "SSE 기반 realtime event와 snapshot reload를 함께 사용합니다.",
  },
  {
    title: "테이블 관리",
    subtitle: "테이블 비밀번호와 세션 완료 처리를 관리합니다.",
    file: "08-admin-tables.png",
    note: "테이블 완료 시 active dashboard 주문에서 제외됩니다.",
  },
  {
    title: "메뉴 관리",
    subtitle: "메뉴 등록, 수정, 삭제, 순서 변경을 수행합니다.",
    file: "09-admin-menus.png",
    note: "메뉴 운영 흐름은 관리자 전용 화면에서 처리합니다.",
  },
  {
    title: "주문 이력",
    subtitle: "테이블과 기간 기준으로 과거 주문을 조회합니다.",
    file: "10-admin-history.png",
    note: "완료된 세션의 주문은 이력 화면에서 확인합니다.",
  },
];

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addTextbox(slide, name, text, position, style) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = style;
  return shape;
}

async function main() {
  const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolModule));
  await fs.mkdir(qaDir, { recursive: true });

  const presentation = Presentation.create({
    slideSize: { width: 1280, height: 720 },
  });

  for (const [index, item] of slides.entries()) {
    const slide = presentation.slides.add();
    slide.background.fill = "#f7f5f1";

    addTextbox(slide, "slide-number", `${index + 1} / ${slides.length}`, {
      left: 72,
      top: 38,
      width: 120,
      height: 24,
    }, {
      fontSize: 14,
      bold: true,
      color: "#6f4d28",
    });

    addTextbox(slide, "title", item.title, {
      left: 72,
      top: 76,
      width: 1050,
      height: 58,
    }, {
      fontSize: 34,
      bold: true,
      color: "#182026",
    });

    addTextbox(slide, "subtitle", item.subtitle, {
      left: 72,
      top: 136,
      width: 1060,
      height: 42,
    }, {
      fontSize: 18,
      color: "#4f5b62",
    });

    slide.shapes.add({
      geometry: "roundRect",
      name: "screenshot-frame",
      position: { left: 71, top: 196, width: 1138, height: 419 },
      fill: "#ffffff",
      line: { style: "solid", fill: "#d8cdc1", width: 1 },
      borderRadius: "rounded-xl",
      shadow: "shadow-sm",
    });

    const imageBytes = await fs.readFile(path.join(screenshotDir, item.file));
    slide.images.add({
      blob: imageBytes,
      contentType: "image/png",
      alt: `${item.title} 화면 캡처`,
      fit: "contain",
      position: { left: 84, top: 209, width: 1112, height: 393 },
    });

    addTextbox(slide, "note", item.note, {
      left: 92,
      top: 638,
      width: 1096,
      height: 34,
    }, {
      fontSize: 16,
      color: "#6f4d28",
    });
  }

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    await writeBlob(path.join(qaDir, `${stem}.png`), png);
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(path.join(qaDir, "deck-montage.webp"), montage);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(pptxPath);
  console.log(pptxPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
