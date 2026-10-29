import { Tag, Typography, theme } from "antd";
import { edges, stageColor, stageLabel, type Page } from "../observe/snapshot.ts";
import { FilterBar } from "./TableView.tsx";
import type { DeskFilter } from "../observe/snapshot.ts";

const { Text, Title } = Typography;
const NODE_H = 72;

type Box = { id: string; x: number; y: number; w: number; h: number };

function layout(pages: Page[]): { boxes: Box[]; modules: { name: string; x: number }[]; width: number; height: number } {
  const modules: string[] = [];
  for (const page of pages) {
    const name = page.module || "—";
    if (!modules.includes(name)) modules.push(name);
  }
  const boxes: Box[] = [];
  const labels: { name: string; x: number }[] = [];
  let x = 48;
  let height = 120;
  for (const name of modules) {
    const column = pages.filter((page) => (page.module || "—") === name);
    labels.push({ name, x });
    let y = 40;
    for (const page of column) {
      const packet = page.type === "Packet";
      boxes.push({ id: page.id, x: x + (packet ? 28 : 0), y, w: packet ? 312 : 340, h: NODE_H });
      y += NODE_H + 16;
    }
    height = Math.max(height, y + 24);
    x += 420;
  }
  return { boxes, modules: labels, width: Math.max(x, 640), height };
}

function boxOf(boxes: Box[], id: string) {
  const box = boxes.find((item) => item.id === id);
  if (!box) return null;
  return { ...box, cy: box.y + box.h / 2, right: box.x + box.w, bottom: box.y + box.h };
}

function dependPath(from: ReturnType<typeof boxOf>, to: ReturnType<typeof boxOf>): string {
  if (!from || !to) return "";
  if (Math.abs(from.x - to.x) < 80) {
    const x = from.x - 22;
    return `M ${from.x} ${from.cy} C ${x} ${from.cy}, ${x} ${to.cy}, ${to.x} ${to.cy}`;
  }
  const x1 = from.x < to.x ? from.right : from.x;
  const x2 = from.x < to.x ? to.x : to.right;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${from.cy} C ${mid} ${from.cy}, ${mid} ${to.cy}, ${x2} ${to.cy}`;
}

export function GraphView({
  allPages,
  pages,
  filters,
  onFilter,
  onOpen,
}: {
  allPages: Page[];
  pages: Page[];
  filters: DeskFilter[];
  onFilter: (filters: DeskFilter[]) => void;
  onOpen: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const placed = layout(pages);
  const relation = edges(pages);
  const byId = new Map(pages.map((page) => [page.id, page]));
  return (
    <>
      <Title level={4} style={{ margin: 0 }}>
        Tower
      </Title>
      <Text type="secondary">Same pages as the table. The filter hides rows and the edges that used them.</Text>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <FilterBar pages={allPages} filters={filters} onChange={onFilter} />
        </div>
        <SpaceLegend />
      </div>
      <div
        data-testid="graph"
        style={{
          position: "relative",
          height: placed.height,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          overflow: "auto",
        }}
      >
        <svg width={placed.width} height={placed.height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <marker id="depend-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={token.colorPrimary} />
            </marker>
          </defs>
          {relation.contains.map((edge) => {
            const from = boxOf(placed.boxes, edge.from);
            const to = boxOf(placed.boxes, edge.to);
            if (!from || !to) return null;
            const spine = to.x - 14;
            return (
              <path
                key={`c-${edge.from}-${edge.to}`}
                data-testid="contains-edge"
                d={`M ${spine} ${from.bottom} L ${spine} ${to.cy} L ${to.x} ${to.cy}`}
                fill="none"
                stroke={token.colorTextQuaternary}
                strokeWidth="1.5"
              />
            );
          })}
          {relation.depends.map((edge) => (
            <path
              key={`d-${edge.from}-${edge.to}`}
              data-testid="depends-edge"
              d={dependPath(boxOf(placed.boxes, edge.from), boxOf(placed.boxes, edge.to))}
              fill="none"
              stroke={token.colorPrimary}
              strokeWidth="1.5"
              strokeDasharray="5 4"
              markerEnd="url(#depend-arrow)"
            />
          ))}
        </svg>
        {placed.modules.map((module) => (
          <Text key={module.name} type="secondary" style={{ position: "absolute", left: module.x, top: 12, fontSize: 12 }}>
            {module.name}
          </Text>
        ))}
        {placed.boxes.map((box) => {
          const page = byId.get(box.id);
          if (!page) return null;
          return (
            <button
              key={page.id}
              type="button"
              data-testid={`node-${page.id}`}
              onClick={() => onOpen(page.id)}
              style={{
                position: "absolute",
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                overflow: "hidden",
                textAlign: "left",
                cursor: "pointer",
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: "8px 10px",
                boxShadow: token.boxShadowTertiary,
                color: token.colorText,
              }}
            >
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Tag color={page.type === "Initiative" ? "blue" : "default"} style={{ marginInlineEnd: 0 }}>
                  {page.type}
                </Tag>
                <Tag color={stageColor(page.stage)} style={{ marginInlineEnd: 0 }}>
                  {stageLabel(page.stage)}
                </Tag>
                {page.evidenceError && page.stage !== "blocked" ? (
                  <Tag color="error" style={{ marginInlineEnd: 0 }}>
                    Blocked
                  </Tag>
                ) : null}
              </span>
              <div style={{ marginTop: 4, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {page.name}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SpaceLegend() {
  const { token } = theme.useToken();
  return (
    <span style={{ display: "inline-flex", gap: 16, marginLeft: 16 }}>
      <Text type="secondary">
        <span style={{ display: "inline-block", width: 22, borderTop: `2px solid ${token.colorTextQuaternary}`, marginRight: 6 }} />
        Contains
      </Text>
      <Text type="secondary">
        <span style={{ display: "inline-block", width: 22, borderTop: `2px dashed ${token.colorPrimary}`, marginRight: 6 }} />
        Depends on
      </Text>
    </span>
  );
}
