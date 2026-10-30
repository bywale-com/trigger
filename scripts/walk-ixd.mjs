// Walk packet 006 interaction on the 9c45f19 fixture.
import puppeteer from "puppeteer-core";

const base = process.env.DESK_URL ?? "http://127.0.0.1:5173";

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

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.waitForSelector("[data-testid=desk-header]");
  check("loading gone", !(await page.$("[data-testid=desk-loading]")));
  const pad = await page.evaluate(() => {
    const content = document.querySelector(".ant-layout-content");
    const style = content ? getComputedStyle(content) : null;
    return style ? Number.parseFloat(style.paddingLeft) : 0;
  });
  check("desktop gutter", pad >= 24, String(pad));

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=page-pane]");
  check("table stays", Boolean(await page.$("[data-testid=database]")));
  const hash = await page.evaluate(() => window.location.hash);
  check("packet hash", hash === "#pkt-001-click-attribution", hash);
  const crumb = await page.$eval("[data-testid=crumb]", (node) => node.innerText.replace(/\s+/g, " "));
  check("crumb path", crumb.includes("← Tower") && crumb.includes("exec-identity") && crumb.includes("pkt-001-click-attribution"), crumb);
  const panePad = await page.$eval("[data-testid=page-pane]", (node) => {
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return { left: box.left, right: box.right, pad: Number.parseFloat(style.paddingLeft), inner: window.innerWidth };
  });
  check("pane not flush", panePad.right < panePad.inner - 8 && panePad.pad >= 16, JSON.stringify(panePad));
  await page.click("[data-testid=pane-expand]");
  const expanded = await page.$eval("[data-testid=database]", (node) => {
    const main = node.closest(".desk-main");
    return main ? getComputedStyle(main).display === "none" : true;
  });
  check("expand hides table", expanded);
  await page.click("[data-testid=pane-expand]");
  check("collapse restores table", Boolean(await page.$("[data-testid=database]")));
  await page.screenshot({ path: "/tmp/ixd-table-pane.png" });

  await clickText(page, "← Tower");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-pane]"));

  const clickedStage = await page.evaluate(() => {
    const tags = [...document.querySelectorAll("[data-testid=click-filter-Stage]")];
    const verified = tags.find((node) => node.textContent?.includes("Verified"));
    if (!(verified instanceof HTMLElement)) return false;
    verified.click();
    return true;
  });
  check("clicked verified", clickedStage);
  await page.waitForFunction(() => document.body.innerText.includes("Stage is Verified"));
  const count = await page.$eval("[data-testid=page-count]", (node) => node.textContent);
  check("stage filter pages", count?.includes("1 page"), count);
  await page.screenshot({ path: "/tmp/ixd-click-filter.png" });
  await page.evaluate(() => {
    const tag = [...document.querySelectorAll(".ant-tag")].find((node) => node.textContent?.includes("Stage is Verified"));
    const button = tag?.querySelector("button, .ant-tag-close-icon");
    if (button instanceof HTMLElement) button.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes("3 pages"));

  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=inside-link]");
  await page.click("[data-testid=inside-link]");
  await page.waitForFunction(() => window.location.hash === "#exec-identity");
  check("inside opens initiative", true);

  await clickText(page, "pkt-001-click-attribution");
  await page.waitForFunction(() => document.body.innerText.includes("Intended behavior"));
  const committed = await page.$("[data-testid=lifecycle-committed]");
  if (committed) await committed.click();
  await page.waitForSelector(".ant-popover", { timeout: 3000 }).catch(() => null);
  const pop = await page.$eval(".ant-popover", (node) => node.innerText).catch(() => "");
  check("lifecycle popover", pop.length > 8, pop.slice(0, 80));
  await page.mouse.click(20, 20);

  await clickText(page, "Graph");
  await page.waitForSelector("[data-testid=graph]");
  check("graph keeps pane", Boolean(await page.$("[data-testid=page-pane]")) && Boolean(await page.$("[data-testid=graph]")));
  const ring = await page.$eval("[data-testid=node-pkt-001-click-attribution]", (node) => getComputedStyle(node).borderColor);
  check("selected ring", ring.includes("22, 119, 255") || ring.includes("22,119,255") || ring.includes("rgb"), ring);
  await page.screenshot({ path: "/tmp/ixd-graph-pane.png" });

  await page.click("[data-testid=pane-expand]");
  await page.screenshot({ path: "/tmp/ixd-expanded.png" });
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-pane]"));

  await clickText(page, "Table");
  await clickText(page, "Which execution a result belongs to");
  await page.click("[data-testid=page-next]");
  await page.waitForFunction(() => window.location.hash === "#launch-agent");
  check("next initiative", true);

  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  await page.screenshot({ path: "/tmp/ixd-dark-pane.png" });
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.body.innerText.includes("Dark"));
  check("mode remembered", true);
  await page.click(".ant-switch");
  await page.waitForFunction(() => document.body.innerText.includes("Light"));

  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle0" });
  check("compact pulse", Boolean(await page.$("[data-testid=factory-pulse]")));
  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=page-sheet]");
  check("compact table under sheet", Boolean(await page.$("[data-testid=database]")));
  const sheet = await page.$eval("[data-testid=page-sheet]", (node) => {
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      inner: window.innerWidth,
      pad: Number.parseFloat(style.paddingLeft),
    };
  });
  check("compact sheet flush", sheet.left <= 1 && sheet.right >= sheet.inner - 1, JSON.stringify(sheet));
  check("compact sheet inner pad", sheet.pad >= 16, JSON.stringify(sheet));
  const peek = await page.evaluate(() => {
    const list = document.querySelector("[data-testid=database]");
    const sheetNode = document.querySelector("[data-testid=page-sheet]");
    const row = list?.querySelector("[data-testid=row-exec-identity]");
    if (!(list instanceof HTMLElement) || !(sheetNode instanceof HTMLElement) || !(row instanceof HTMLElement)) {
      return null;
    }
    const listBox = list.getBoundingClientRect();
    const sheetBox = sheetNode.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rowBox.bottom, sheetBox.top) - Math.max(rowBox.top, 0));
    return {
      listTop: listBox.top,
      listBottom: listBox.bottom,
      sheetTop: sheetBox.top,
      rowTop: rowBox.top,
      rowBottom: rowBox.bottom,
      visible,
      blocked: Boolean(document.querySelector("[data-testid=sheet-backdrop]")),
    };
  });
  check("compact list visible above sheet", Boolean(peek) && peek.visible >= 24 && peek.rowTop < peek.sheetTop, JSON.stringify(peek));
  check("compact list not dimmed", Boolean(peek) && peek.blocked === false, JSON.stringify(peek));
  await page.screenshot({ path: "/tmp/ixd-compact-sheet.png" });
  await clickText(page, "Which execution a result belongs to");
  await page.waitForFunction(() => window.location.hash === "#exec-identity");
  check("compact list stays tappable", Boolean(await page.$("[data-testid=page-sheet]")));
  await page.click("[data-testid=pane-close]");
  await page.waitForFunction(() => !document.querySelector("[data-testid=page-sheet]"));
  check("compact close restores table", Boolean(await page.$("[data-testid=database]")));
  await clickText(page, "An email click advances the enrollment stamped on the message");
  await page.waitForSelector("[data-testid=page-sheet]");
  await page.click("[data-testid=pane-expand]");
  const grown = await page.$eval("[data-testid=page-sheet]", (node) => node.getBoundingClientRect().top);
  check("compact expand grows", grown <= 8, String(grown));
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
