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

async function board(page) {
  return page.evaluate(() => {
    const scroller = document.querySelector(".desk-board .ant-table-content");
    const headerNodes = [...document.querySelectorAll(".desk-board .ant-table-thead th")];
    const headers = headerNodes.map((node) => node.innerText.trim()).filter(Boolean);
    const rows = [...document.querySelectorAll("[data-testid^=row-]")];
    const widths = (row) => [...row.querySelectorAll("td")].map((cell) => Math.round(cell.getBoundingClientRect().width));
    const first = rows[0] ? widths(rows[0]) : [];
    const last = rows.length ? widths(rows[rows.length - 1]) : [];
    const head = headerNodes.map((node) => Math.round(node.getBoundingClientRect().width));
    const even =
      first.length >= 9 &&
      first.length === last.length &&
      first.every((value, index) => Math.abs(value - last[index]) <= 1) &&
      head.length >= first.length &&
      first.every((value, index) => Math.abs(value - head[index]) <= 2);
    const sample = rows[0]?.querySelector("td");
    const style = sample ? getComputedStyle(sample) : null;
    const border = style ? Math.max(parseFloat(style.borderRightWidth) || 0, parseFloat(style.borderBottomWidth) || 0) : 0;
    return {
      headers,
      even,
      border,
      name: first[0] ?? 0,
      scrollWidth: scroller?.scrollWidth ?? 0,
      clientWidth: scroller?.clientWidth ?? 0,
      first,
      head,
    };
  });
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
    check(
      `${width} header`,
      header.includes("Trigger") && header.includes("Light") && !header.includes("Tower") && !header.includes("Ledger revision"),
      header.replaceAll("\n", " | "),
    );
    await page.click("[data-testid=header-details]");
    const opened = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
    check(
      `${width} header details`,
      opened.includes("Tower") && opened.includes("9c45f19") && opened.includes("Ledger revision 1") && opened.includes("scope inactive"),
      opened.replaceAll("\n", " | "),
    );
    await page.click("[data-testid=header-details]");
    const closed = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
    check(`${width} header details close`, !closed.includes("Ledger revision"), closed.replaceAll("\n", " | "));
    check(`${width} pulse minimized`, !(await page.$("[data-testid=pulse-detail]")));
    const box = await overflow(page);
    check(`${width} no page overflow`, box.scroll <= box.inner + 1, JSON.stringify(box));
    const list = await page.$("[data-testid=work-list]");
    const table = await page.$("[data-testid=database]");
    check(`${width} table board`, Boolean(table) && !list);
    const shape = await board(page);
    check(
      `${width} table header`,
      shape.headers.join("|") === "Name|Type|Module|Stage|Execution|Evidence|Inside|Depends on|Updated",
      shape.headers.join("|"),
    );
    check(`${width} column borders`, shape.border >= 1, String(shape.border));
    check(`${width} columns even`, shape.even, JSON.stringify({ first: shape.first, head: shape.head }));
    check(`${width} name holds its width`, shape.name >= 200, String(shape.name));
    check(
      `${width} board scrolls sideways`,
      shape.scrollWidth > shape.clientWidth + 8,
      JSON.stringify({ scrollWidth: shape.scrollWidth, clientWidth: shape.clientWidth }),
    );
    const body = await page.evaluate(() => document.body.innerText);
    check(`${width} three names`, body.includes("Which execution a result belongs to") && body.includes("An email click advances") && body.includes("Launch Agent"));
    check(`${width} execution`, body.includes("Idle · no dispatch") && body.includes("Manual · not live"));
    check(`${width} evidence`, body.includes("1 verified · not integrated") && body.includes("Blocked reason"));
    const rowBox = await page.$eval("[data-testid=row-exec-identity]", (node) => node.getBoundingClientRect().height);
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
  check("360 table stays under sheet", Boolean(await page.$("[data-testid=database]")) && Boolean(await page.$("[data-testid=page-sheet]")));
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
  check("360 sheet has no enlarge", !(await page.$("[data-testid=page-sheet] [data-testid=pane-expand]")) && Boolean(await page.$("[data-testid=sheet-grab]")));
  const preview = await page.$eval("[data-testid=page-sheet]", (node) => {
    const box = node.getBoundingClientRect();
    return { height: box.height, top: box.top };
  });
  check("360 preview taller", preview.height >= 380 && preview.top < 460 && preview.top > 280, JSON.stringify(preview));
  const beforeTop = preview.top;
  await page.evaluate(() => {
    const node = document.querySelector("[data-testid=sheet-grab]");
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const start = rect.top + rect.height / 2;
    const end = start - 90;
    const fire = (type, y) =>
      node.dispatchEvent(
        new PointerEvent(type, { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y, bubbles: true, cancelable: true, buttons: 1 }),
      );
    fire("pointerdown", start);
    for (let step = 1; step <= 6; step += 1) fire("pointermove", start + ((end - start) * step) / 6);
    fire("pointerup", end);
  });
  const nudged = await page.$eval("[data-testid=page-sheet]", (node, before) => {
    const box = node.getBoundingClientRect();
    return { before, top: box.top, height: box.height };
  }, beforeTop);
  check(
    "360 lip drags the preview",
    Boolean(nudged) && nudged.top < nudged.before - 40 && nudged.top > 8,
    JSON.stringify(nudged),
  );
  await page.evaluate(() => {
    const node = document.querySelector("[data-testid=sheet-grab]");
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const start = rect.top + rect.height / 2;
    const fire = (type, y) =>
      node.dispatchEvent(
        new PointerEvent(type, { pointerId: 1, pointerType: "mouse", clientX: x, clientY: y, bubbles: true, cancelable: true, buttons: 1 }),
      );
    fire("pointerdown", start);
    for (let step = 1; step <= 8; step += 1) fire("pointermove", start + ((4 - start) * step) / 8);
    fire("pointerup", 4);
  });
  const grown = await page.$eval("[data-testid=page-sheet]", (node) => node.getBoundingClientRect().top);
  check("360 lip fills the screen", grown <= 8, String(grown));
  await page.keyboard.press("Escape");
  const rested = await page.$eval("[data-testid=page-sheet]", (node) => node.getBoundingClientRect().top);
  check("360 escape restores the preview", rested > 80, String(rested));
  check("360 sheet inner pad", sheetBox.pad >= 16, JSON.stringify(sheetBox));
  const initiative = await page.$eval("[data-testid=detail]", (node) => node.innerText);
  check("360 initiative obligation", initiative.includes("Specify and, where a packet is released"));
  check("360 initiative spec", initiative.includes("a completion belongs to the pursuit that asked for it"));
  const initOverflow = await overflow(page);
  check("360 initiative overflow", initOverflow.scroll <= initOverflow.inner + 1, JSON.stringify(initOverflow));
  await shot(page, "desk-mobile-360-initiative-light");

  await clickText(page, "← Tower");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-sheet]"));
  await page.waitForSelector("[data-testid=database]");
  check("360 back to table", Boolean(await page.$("[data-testid=database]")));

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=detail]");
  check("360 packet sheet", Boolean(await page.$("[data-testid=page-sheet]")) && Boolean(await page.$("[data-testid=database]")));
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
  await page.waitForSelector("[data-testid=database]");
  await shot(page, "desk-mobile-360-table-dark");
  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=detail]");
  await shot(page, "desk-mobile-360-packet-dark");

  await page.setViewport({ width: 1440, height: 1000, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.waitForSelector("[data-testid=database]");
  check("1440 still table", Boolean(await page.$("[data-testid=database]")) && !(await page.$("[data-testid=work-list]")));
  const wide = await board(page);
  check("1440 columns even", wide.even, JSON.stringify({ first: wide.first, head: wide.head }));
  check("1440 name holds its width", wide.name >= 200, String(wide.name));
  check("1440 header includes Updated", wide.headers.includes("Updated"), wide.headers.join("|"));

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
    await page.click("[data-testid=header-details]");
    const liveHeader = await page.$eval("[data-testid=desk-header]", (node) => node.innerText);
    const expectRef = process.env.EXPECT_REF ?? "";
    check(
      "360 live header",
      liveHeader.includes("Trigger") &&
        liveHeader.includes("Tower ·") &&
        /Ledger revision \d+/.test(liveHeader) &&
        (!expectRef || liveHeader.includes(expectRef)),
      liveHeader.replaceAll("\n", " | "),
    );
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
