import { spawn } from "node:child_process";
import { mkdir, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "reports", "demo-presentation");
const screenshotDir = path.join(outDir, "screenshots");
const pptWorkDir = path.join(outDir, "pptx-work");
const pptxPath = path.join(outDir, "table-order-demo.pptx");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = "http://127.0.0.1:3000";
const width = 1366;
const height = 768;

const slides = [
  {
    title: "Table Order MVP",
    subtitle: "고객 주문과 관리자 운영을 한 흐름에서 확인하는 테이블 주문 프로토타입",
    path: "/",
    file: "01-home.png",
    note: "첫 화면에서 고객 주문과 관리자 운영 진입점을 분리합니다."
  },
  {
    title: "고객 테이블 설정",
    subtitle: "매장 코드와 테이블 비밀번호로 고객의 주문 세션을 시작합니다.",
    path: "/customer/setup",
    file: "02-customer-setup.png",
    note: "데모 입력값은 demo-store, 1번 테이블, table-1입니다."
  },
  {
    title: "고객 메뉴 탐색",
    subtitle: "카테고리별 메뉴를 확인하고 장바구니에 담습니다.",
    path: "/customer/menu",
    file: "03-customer-menu.png",
    note: "메뉴 seed data로 식사, 음료, 사이드 카테고리를 제공합니다.",
    prepare: "customer"
  },
  {
    title: "고객 장바구니",
    subtitle: "수량 조정과 총액 확인 후 주문을 제출합니다.",
    path: "/customer/cart",
    file: "04-customer-cart.png",
    note: "장바구니 총액은 line total 합과 일치하도록 검증됩니다.",
    prepare: "customerCart"
  },
  {
    title: "고객 주문 내역",
    subtitle: "현재 테이블 세션에서 제출한 주문을 확인합니다.",
    path: "/customer/orders",
    file: "05-customer-orders.png",
    note: "주문 제출 후 현재 세션 주문 목록이 표시됩니다.",
    prepare: "customerOrder"
  },
  {
    title: "관리자 로그인",
    subtitle: "데모 관리자 계정으로 운영 화면에 접근합니다.",
    path: "/admin/login",
    file: "06-admin-login.png",
    note: "데모 입력값은 demo-store, admin입니다."
  },
  {
    title: "관리자 대시보드",
    subtitle: "테이블별 실시간 주문 현황과 주문 상태를 관리합니다.",
    path: "/admin/dashboard",
    file: "07-admin-dashboard.png",
    note: "SSE 기반 realtime event와 snapshot reload를 함께 사용합니다.",
    prepare: "admin"
  },
  {
    title: "테이블 관리",
    subtitle: "테이블 비밀번호와 세션 완료 처리를 관리합니다.",
    path: "/admin/tables",
    file: "08-admin-tables.png",
    note: "테이블 완료 시 active dashboard 주문에서 제외됩니다.",
    prepare: "admin"
  },
  {
    title: "메뉴 관리",
    subtitle: "메뉴 등록, 수정, 삭제, 순서 변경을 수행합니다.",
    path: "/admin/menus",
    file: "09-admin-menus.png",
    note: "메뉴 운영 흐름은 관리자 전용 화면에서 처리합니다.",
    prepare: "admin"
  },
  {
    title: "주문 이력",
    subtitle: "테이블과 기간 기준으로 과거 주문을 조회합니다.",
    path: "/admin/history",
    file: "10-admin-history.png",
    note: "완료된 세션의 주문은 이력 화면에서 확인합니다.",
    prepare: "admin"
  }
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

class CdpPage {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      const waiters = this.events.get(message.method) ?? [];
      for (const resolve of waiters) resolve(message.params);
      this.events.set(message.method, []);
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitFor(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const waiters = this.events.get(method) ?? [];
      waiters.push((params) => {
        clearTimeout(timer);
        resolve(params);
      });
      this.events.set(method, waiters);
    });
  }
}

async function launchChrome() {
  const userDataDir = path.join(outDir, "chrome-profile");
  await rm(userDataDir, { recursive: true, force: true });
  await mkdir(userDataDir, { recursive: true });
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=9222`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    "about:blank"
  ];
  const chrome = spawn(chromePath, args, { stdio: "ignore" });
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await requestJson("http://127.0.0.1:9222/json/version");
      return chrome;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Chrome DevTools endpoint did not become ready.");
}

async function createPage() {
  const target = await requestJson("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const page = new CdpPage(ws);
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  });
  return page;
}

async function navigate(page, url) {
  const loaded = page.waitFor("Page.loadEventFired");
  await page.send("Page.navigate", { url });
  await loaded.catch(() => undefined);
  await delay(900);
}

async function evaluate(page, expression) {
  return page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
}

async function prepareCustomer(page) {
  await navigate(page, `${baseUrl}/customer/setup`);
  await evaluate(page, `
    (async () => {
      const response = await fetch('/api/customer/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storeCode: 'demo-store', tableNumber: '1', tablePassword: 'table-1' })
      });
      const payload = await response.json();
      localStorage.setItem('table-order:customer:table-context', JSON.stringify(payload.data));
      localStorage.removeItem('table-order:customer:cart');
      sessionStorage.removeItem('table-order:admin:session');
      return payload;
    })()
  `);
}

async function prepareCustomerCart(page) {
  await prepareCustomer(page);
  await navigate(page, `${baseUrl}/customer/menu`);
  await evaluate(page, `
    (() => {
      const buttons = [...document.querySelectorAll('button[data-testid$="-add-button"]')];
      buttons[0]?.click();
      buttons[1]?.click();
      return buttons.length;
    })()
  `);
  await delay(500);
}

async function prepareCustomerOrder(page) {
  await prepareCustomerCart(page);
  await navigate(page, `${baseUrl}/customer/cart`);
  await evaluate(page, `document.querySelector('[data-testid="cart-submit-button"]')?.click()`);
  await delay(1000);
}

async function prepareAdmin(page) {
  await navigate(page, `${baseUrl}/admin/login`);
  await evaluate(page, `
    (async () => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storeCode: 'demo-store', password: 'admin' })
      });
      const payload = await response.json();
      sessionStorage.setItem('table-order:admin:session', JSON.stringify(payload.data));
      return payload;
    })()
  `);
}

async function capture(page, slide) {
  if (slide.prepare === "customer") await prepareCustomer(page);
  if (slide.prepare === "customerCart") await prepareCustomerCart(page);
  if (slide.prepare === "customerOrder") await prepareCustomerOrder(page);
  if (slide.prepare === "admin") await prepareAdmin(page);
  await navigate(page, `${baseUrl}${slide.path}`);
  const result = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(path.join(screenshotDir, slide.file), Buffer.from(result.data, "base64"));
}

function contentTypesXml() {
  const imageOverrides = slides.map((_, index) => `<Override PartName="/ppt/media/image${index + 1}.png" ContentType="image/png"/>`).join("");
  const slideOverrides = slides.map((_, index) => `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${slideOverrides}
  ${imageOverrides}
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function presentationXml() {
  const ids = slides.map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${ids}</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
}

function presentationRelsXml() {
  const slideRels = slides.map((_, index) => `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slideRels}
</Relationships>`;
}

function slideXml(slide, index) {
  const title = xmlEscape(slide.title);
  const subtitle = xmlEscape(slide.subtitle);
  const note = xmlEscape(slide.note);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="F7F5F1"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="228600"/><a:ext cx="11277600" cy="548640"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="3000" b="1"><a:solidFill><a:srgbClr val="182026"/></a:solidFill></a:rPr><a:t>${title}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Subtitle"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="822960"/><a:ext cx="11277600" cy="396240"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="1500"><a:solidFill><a:srgbClr val="4F5B62"/></a:solidFill></a:rPr><a:t>${subtitle}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="4" name="Screenshot ${index + 1}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="609600" y="1371600"/><a:ext cx="10972800" cy="4693920"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="Note"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="609600" y="6225540"/><a:ext cx="10972800" cy="365760"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="1200"><a:solidFill><a:srgbClr val="6F4D28"/></a:solidFill></a:rPr><a:t>${note}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function slideRelsXml(index) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${index + 1}.png"/>
</Relationships>`;
}

const emptyMaster = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`;

const emptyLayout = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;

const theme = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Table Order Theme">
  <a:themeElements>
    <a:clrScheme name="Table Order"><a:dk1><a:srgbClr val="182026"/></a:dk1><a:lt1><a:srgbClr val="F7F5F1"/></a:lt1><a:dk2><a:srgbClr val="263238"/></a:dk2><a:lt2><a:srgbClr val="FFFFFF"/></a:lt2><a:accent1><a:srgbClr val="1F6F5B"/></a:accent1><a:accent2><a:srgbClr val="E8DED1"/></a:accent2><a:accent3><a:srgbClr val="9D3D35"/></a:accent3><a:accent4><a:srgbClr val="E0B84D"/></a:accent4><a:accent5><a:srgbClr val="4F5B62"/></a:accent5><a:accent6><a:srgbClr val="6F4D28"/></a:accent6><a:hlink><a:srgbClr val="1F6F5B"/></a:hlink><a:folHlink><a:srgbClr val="6F4D28"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Arial"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Default"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>`;

async function generatePptx() {
  await rm(pptWorkDir, { recursive: true, force: true });
  await mkdir(path.join(pptWorkDir, "_rels"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "docProps"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "_rels"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "slides", "_rels"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "media"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "slideMasters", "_rels"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "slideLayouts", "_rels"), { recursive: true });
  await mkdir(path.join(pptWorkDir, "ppt", "theme"), { recursive: true });

  await writeFile(path.join(pptWorkDir, "[Content_Types].xml"), contentTypesXml());
  await writeFile(path.join(pptWorkDir, "_rels", ".rels"), rootRelsXml());
  await writeFile(path.join(pptWorkDir, "ppt", "presentation.xml"), presentationXml());
  await writeFile(path.join(pptWorkDir, "ppt", "_rels", "presentation.xml.rels"), presentationRelsXml());
  await writeFile(path.join(pptWorkDir, "ppt", "slideMasters", "slideMaster1.xml"), emptyMaster);
  await writeFile(path.join(pptWorkDir, "ppt", "slideMasters", "_rels", "slideMaster1.xml.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`);
  await writeFile(path.join(pptWorkDir, "ppt", "slideLayouts", "slideLayout1.xml"), emptyLayout);
  await writeFile(path.join(pptWorkDir, "ppt", "slideLayouts", "_rels", "slideLayout1.xml.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`);
  await writeFile(path.join(pptWorkDir, "ppt", "theme", "theme1.xml"), theme);
  await writeFile(path.join(pptWorkDir, "docProps", "core.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Table Order MVP Demo</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified></cp:coreProperties>`);
  await writeFile(path.join(pptWorkDir, "docProps", "app.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Codex</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>${slides.length}</Slides></Properties>`);

  for (const [index, slide] of slides.entries()) {
    await writeFile(path.join(pptWorkDir, "ppt", "slides", `slide${index + 1}.xml`), slideXml(slide, index));
    await writeFile(path.join(pptWorkDir, "ppt", "slides", "_rels", `slide${index + 1}.xml.rels`), slideRelsXml(index));
    await copyFile(path.join(screenshotDir, slide.file), path.join(pptWorkDir, "ppt", "media", `image${index + 1}.png`));
  }

  await rm(pptxPath, { force: true });
  await new Promise((resolve, reject) => {
    const zip = spawn("zip", ["-qr", pptxPath, "."], { cwd: pptWorkDir });
    zip.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`zip exited with ${code}`))));
  });
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  const chrome = await launchChrome();
  try {
    const page = await createPage();
    for (const slide of slides) {
      console.log(`Capturing ${slide.file}`);
      await capture(page, slide);
    }
    await generatePptx();
    console.log(`PPTX written to ${pptxPath}`);
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
