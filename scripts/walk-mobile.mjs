// Walk the compact shell at phone and tablet widths. DESK_URL is the 9c45f19 fixture.
import { writeFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const base = process.env.DESK_URL ?? "http://127.0.0.1:5183";
const plates = process.env.PLATES_URL ?? "";
const live = process.env.LIVE_URL ?? "";

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});

const failures = [];
function check(name, ok, detail = "") {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
  console.log(`${ok ? "ok" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function clickText(page, value) {
  await page.waitForFunction((text) => {
    const nodes = [...document.querySelectorAll("button, a, td, span, div, label, h1, h2, h4")];
    return nodes.some((item) => item.textContent === text || item.textContent?.trim() === text);
  }, {}, value);
  const clicked = await page.evaluate((text) => {
    const nodes = [...document.querySelectorAll("button, a, td, span, div, label, h1, h2, h4")];
    const matches = nodes.filter((item) => item.textContent === text || item.textContent?.trim() === text);
    const node = matches.find((item) => !matches.some((other) => other !== item && item.contains(other)));
    if (!node) return false;
    node.click();
    return true;
  }, value);
  if (!clicked) throw new Error(`missing text: ${value}`);
}

async function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return { scroll: doc.scrollWidth, inner: window.innerWidth, header: document.querySelector("[data-testid=desk-header]")?.scrollWidth ?? 0 };
  });
}

async function shot(page, name) {
  await page.screenshot({ path: `/tmp/${name}.png`, fullPage: true });
}

try {
  const page = await browser.newPage();

  for (const width of [360, 390, 430, 768]) {
    await page.setViewport({ width, height: 800, isMobile: width < 768, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(base, { waitUntil: "networkidle0" });
    await page.waitForSelector("[data-testid=desk-header]");
    const header = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
    check(`${width} header`, header.includes("Trigger") && header.includes("Tower") && header.includes("9c45f19") && header.includes("Light"), header.replaceAll("\n", " | "));
    const box = await overflow(page);
    check(`${width} no page overflow`, box.scroll <= box.inner + 1, JSON.stringify(box));
    const list = await page.$("[data-testid=work-list]");
    const table = await page.$("[data-testid=database]");
    check(`${width} work list not table`, Boolean(list) && !table);
    const body = await page.evaluate(() => document.body.innerText);
    check(`${width} three names`, body.includes("Which execution a result belongs to") && body.includes("An email click advances") && body.includes("Launch Agent"));
    check(`${width} execution`, body.includes("Idle · no dispatch") && body.includes("Manual · not live"));
    check(`${width} evidence`, body.includes("1 verified · not integrated") && body.includes("Blocked reason"));
    const rowBox = await page.$eval("[data-testid=work-list] button", (node) => node.getBoundingClientRect().height);
    check(`${width} dense rows`, rowBox < 140, String(rowBox));
    const buttons = await page.$$eval("button", (nodes) => nodes.map((node) => node.innerText.trim()));
    check(
      `${width} no factory controls`,
      !buttons.some((label) => ["Run", "Stop", "Authorize", "Dispatch", "Approve"].includes(label)),
    );
    await shot(page, `desk-mobile-${width}-table-light`);
  }

  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle0" });
  await clickText(page, "Which execution a result belongs to");
  await page.waitForSelector("[data-testid=detail]");
  check("360 list stays under sheet", Boolean(await page.$("[data-testid=work-list]")) && Boolean(await page.$("[data-testid=page-sheet]")));
  const peek = await page.evaluate(() => {
    const row = document.querySelector("[data-testid=row-exec-identity]");
    const sheetNode = document.querySelector("[data-testid=page-sheet]");
    if (!(row instanceof HTMLElement) || !(sheetNode instanceof HTMLElement)) return null;
    const rowBox = row.getBoundingClientRect();
    const sheetBox = sheetNode.getBoundingClientRect();
    return {
      visible: Math.max(0, Math.min(rowBox.bottom, sheetBox.top) - Math.max(rowBox.top, 0)),
      rowTop: rowBox.top,
      sheetTop: sheetBox.top,
      blocked: Boolean(document.querySelector("[data-testid=sheet-backdrop]")),
    };
  });
  check("360 list visible above sheet", Boolean(peek) && peek.visible >= 24 && peek.rowTop < peek.sheetTop, JSON.stringify(peek));
  check("360 list not blocked", Boolean(peek) && peek.blocked === false, JSON.stringify(peek));
  const sheetBox = await page.$eval("[data-testid=page-sheet]", (node) => {
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      left: box.left,
      right: box.right,
      inner: window.innerWidth,
      pad: Number.parseFloat(style.paddingLeft),
    };
  });
  check("360 sheet flush", sheetBox.left <= 1 && sheetBox.right >= sheetBox.inner - 1, JSON.stringify(sheetBox));
  check("360 sheet inner pad", sheetBox.pad >= 16, JSON.stringify(sheetBox));
  const initiative = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("360 initiative obligation", initiative.includes("Specify and, where a packet is released"));
  check("360 initiative spec", initiative.includes("a completion belongs to the pursuit that asked for it"));
  const initOverflow = await overflow(page);
  check("360 initiative overflow", initOverflow.scroll <= initOverflow.inner + 1, JSON.stringify(initOverflow));
  await shot(page, "desk-mobile-360-initiative-light");

  await clickText(page, "← Tower");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-sheet]"));
  await page.waitForSelector("[data-testid=work-list]");
  check("360 back to list", Boolean(await page.$("[data-testid=work-list]")));

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=detail]");
  check("360 packet sheet", Boolean(await page.$("[data-testid=page-sheet]")) && Boolean(await page.$("[data-testid=work-list]")));
  const packet = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("360 packet intended", packet.includes("An email click advances the enrollment named on the outbound message."));
  check("360 packet lifecycle", packet.includes("Dispatched no") && packet.includes("Verified yes"));
  check("360 packet github", packet.includes("unavailable"));
  const packOverflow = await overflow(page);
  check("360 packet overflow", packOverflow.scroll <= packOverflow.inner + 1, JSON.stringify(packOverflow));
  await shot(page, "desk-mobile-360-packet-light");

  await clickText(page, "← Tower");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-sheet]"));
  await clickText(page, "Graph");
  await page.waitForSelector("[data-testid=graph]");
  check("360 graph from packet", Boolean(await page.$("[data-testid=graph]")));
  const nodes = await page.$$eval("[data-testid^=node-]", (list) => list.map((node) => node.getAttribute("data-testid")));
  check("360 graph nodes", nodes.length === 3, nodes.join(","));
  const graphOverflow = await overflow(page);
  check("360 graph overflow", graphOverflow.scroll <= graphOverflow.inner + 1, JSON.stringify(graphOverflow));

  const before = await page.$eval("[data-testid=graph-canvas]", (node) => node.style.transform);
  await page.$eval("[data-testid=graph]", (node) => {
    const rect = node.getBoundingClientRect();
    const fire = (type, id, x, y) =>
      node.dispatchEvent(
        new PointerEvent(type, { pointerId: id, pointerType: "touch", clientX: x, clientY: y, bubbles: true, cancelable: true }),
      );
    fire("pointerdown", 1, rect.left + 40, rect.top + 80);
    fire("pointermove", 1, rect.left + 120, rect.top + 140);
    fire("pointerup", 1, rect.left + 120, rect.top + 140);
    fire("pointerdown", 1, rect.left + 80, rect.top + 100);
    fire("pointerdown", 2, rect.left + 160, rect.top + 100);
    fire("pointermove", 1, rect.left + 40, rect.top + 100);
    fire("pointermove", 2, rect.left + 220, rect.top + 100);
    fire("pointerup", 1, rect.left + 40, rect.top + 100);
    fire("pointerup", 2, rect.left + 220, rect.top + 100);
  });
  const after = await page.$eval("[data-testid=graph-canvas]", (node) => node.style.transform);
  check("360 graph pan or pinch", after !== before && after.includes("scale"), `${before} -> ${after}`);
  await shot(page, "desk-mobile-360-graph-light");
  await page.waitForTimeout?.(400).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.$eval("[data-testid=node-launch-agent]", (node) => node.click());
  await page.waitForSelector("[data-testid=detail]");
  const blocked = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("360 tap node", blocked.includes("Factory production path is not the Launch Agent build."));
  await clickText(page, "← Tower");
  await page.waitForSelector("[data-testid=graph]");
  check("360 back keeps graph", Boolean(await page.$("[data-testid=graph]")));

  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  const darkBg = await page.$eval(".ant-layout-header", (node) => getComputedStyle(node).backgroundColor);
  check("360 dark header", darkBg === "rgb(20, 20, 20)", darkBg);
  await shot(page, "desk-mobile-360-graph-dark");
  await clickText(page, "Table");
  await page.waitForSelector("[data-testid=work-list]");
  await shot(page, "desk-mobile-360-table-dark");
  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=detail]");
  await shot(page, "desk-mobile-360-packet-dark");

  await page.setViewport({ width: 1440, height: 1000, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.waitForSelector("[data-testid=database]");
  check("1440 still table", Boolean(await page.$("[data-testid=database]")) && !(await page.$("[data-testid=work-list]")));
  const updated = await page.evaluate(() => {
    const headers = [...document.querySelectorAll(".ant-table-thead th")].map((node) => {
      const box = node.getBoundingClientRect();
      return { text: node.innerText.trim(), left: box.left, right: box.right };
    });
    const col = headers.find((item) => item.text === "Updated");
    return { col, width: window.innerWidth };
  });
  check(
    "1440 updated in view",
    Boolean(updated.col) && updated.col.left >= 0 && updated.col.right <= updated.width + 1,
    JSON.stringify(updated),
  );

  if (plates) {
    await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(plates, { waitUntil: "networkidle0" });
    await clickText(page, "An email click advances the enrollment stamped on the message");
    await page.waitForSelector("[data-testid=plates]");
    const plateWidth = await page.$eval("[data-testid=plate-image]", (node) => {
      const box = node.getBoundingClientRect();
      return { width: box.width, inner: window.innerWidth };
    });
    check("360 plate full width", plateWidth.width >= plateWidth.inner - 48, JSON.stringify(plateWidth));
    await page.click("[data-testid=plate-image] img");
    await page.waitForSelector(".ant-image-preview-root, .ant-image-preview-wrap", { timeout: 4000 }).catch(() => null);
    const preview = await page.$(".ant-image-preview-img, .ant-image-preview-root");
    check("360 plate enlarge", Boolean(preview));
    await shot(page, "desk-mobile-360-plates-light");
    if (preview) {
      await page.keyboard.press("Escape").catch(() => {});
      const closer = await page.$(".ant-image-preview-close, .ant-image-preview-operations-operation");
      if (closer) await closer.click().catch(() => {});
    }
  }

  if (live) {
    await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(live, { waitUntil: "networkidle0" });
    await page.waitForSelector("[data-testid=desk-header]");
    const liveHeader = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
    check("360 live header", liveHeader.includes("Trigger") && liveHeader.includes("cursor/factory-agents-scope-33ee") && /PR \d+/.test(liveHeader), liveHeader.replaceAll("\n", " | "));
    const liveOverflow = await overflow(page);
    check("360 live overflow", liveOverflow.scroll <= liveOverflow.inner + 1, JSON.stringify(liveOverflow));
    const liveBody = await page.evaluate(() => document.body.innerText);
    check("360 live pages", liveBody.includes("Opening an ask") && /\d+ pages/.test(liveBody), liveBody.match(/\d+ pages/)?.[0]);
    await shot(page, "desk-mobile-360-live-table-light");
    await clickText(page, "An email click advances the enrollment stamped on the message");
    await page.waitForSelector("[data-testid=detail]");
    const livePacket = await page.$eval("[data-testid=detail]", (node) => node.innerText);
    check("360 live accepted", livePacket.includes("Accepted yes") && livePacket.includes("Integrated yes"));
    const livePackOverflow = await overflow(page);
    check("360 live packet overflow", livePackOverflow.scroll <= livePackOverflow.inner + 1, JSON.stringify(livePackOverflow));
    await shot(page, "desk-mobile-360-live-packet-light");
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
