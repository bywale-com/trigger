export type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: number; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "code"; lang: string; value: string }
  | { type: "quote"; children: Inline[] }
  | { type: "hr" };

export function stripLeadingTitle(markdown: string): string {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const first = lines.findIndex((line) => line.trim());
  if (first < 0) return "";
  if (/^#\s+\S/.test(lines[first] ?? "")) {
    lines.splice(first, 1);
    if (lines[first] === "") lines.splice(first, 1);
  }
  return lines.join("\n").trim();
}

function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return trimmed || null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[./]/.test(trimmed) && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return null;
}

function parseInline(text: string): Inline[] {
  const nodes: Inline[] = [];
  let rest = text;
  const pushText = (value: string) => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last?.type === "text") last.value += value;
    else nodes.push({ type: "text", value });
  };
  while (rest) {
    const code = /^`([^`]+)`/.exec(rest);
    if (code) {
      nodes.push({ type: "code", value: code[1] });
      rest = rest.slice(code[0].length);
      continue;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)/.exec(rest);
    if (link) {
      const href = safeHref(link[2]);
      if (href) nodes.push({ type: "link", href, children: parseInline(link[1]) });
      else pushText(link[1]);
      rest = rest.slice(link[0].length);
      continue;
    }
    const strong = /^\*\*(.+?)\*\*/.exec(rest) ?? /^__(.+?)__/.exec(rest);
    if (strong) {
      nodes.push({ type: "strong", children: parseInline(strong[1]) });
      rest = rest.slice(strong[0].length);
      continue;
    }
    const em = /^\*(?!\*)([^*]+)\*/.exec(rest);
    if (em) {
      nodes.push({ type: "em", children: parseInline(em[1]) });
      rest = rest.slice(em[0].length);
      continue;
    }
    const next = rest.search(/`|\*\*|__|\[[^\]]+\]\(|\*(?!\*)/);
    if (next < 0) {
      pushText(rest);
      break;
    }
    if (next === 0) {
      pushText(rest[0] ?? "");
      rest = rest.slice(1);
      continue;
    }
    pushText(rest.slice(0, next));
    rest = rest.slice(next);
  }
  return nodes;
}

function bullet(line: string): { ordered: boolean; text: string } | null {
  const ul = /^[-*+]\s+(.+)$/.exec(line);
  if (ul) return { ordered: false, text: ul[1] };
  const ol = /^\d+[.)]\s+(.+)$/.exec(line);
  if (ol) return { ordered: true, text: ol[1] };
  return null;
}

export function parseFactoryMarkdown(markdown: string, options?: { stripTitle?: boolean }): Block[] {
  const source = options?.stripTitle ? stripLeadingTitle(markdown) : markdown.replace(/^\uFEFF/, "").trim();
  if (!source) return [];
  const lines = source.split(/\r?\n/);
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index] ?? "")) {
        body.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", lang: fence[1] ?? "", value: body.join("\n") });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, children: parseInline(heading[2].trim()) });
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quoted: string[] = [];
      while (index < lines.length && (lines[index]?.startsWith("> ") || lines[index] === ">")) {
        quoted.push((lines[index] ?? "").replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", children: parseInline(quoted.join(" ").trim()) });
      continue;
    }
    const item = bullet(line);
    if (item) {
      const ordered = item.ordered;
      const items: Inline[][] = [];
      while (index < lines.length) {
        const next = bullet(lines[index] ?? "");
        if (!next || next.ordered !== ordered) break;
        items.push(parseInline(next.text));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const para: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const peek = lines[index] ?? "";
      if (!peek.trim()) break;
      if (/^(#{1,4})\s+/.test(peek) || bullet(peek) || peek.startsWith("> ") || peek.startsWith("```") || /^(-{3,}|\*{3,})\s*$/.test(peek)) {
        break;
      }
      para.push(peek);
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseInline(para.join(" ").replace(/\s+/g, " ").trim()) });
  }
  return blocks;
}

export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" || node.type === "code") return node.value;
      if (node.type === "link" || node.type === "strong" || node.type === "em") return inlineText(node.children);
      return "";
    })
    .join("");
}
