import { Spin, Tag, Typography, theme } from "antd";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { edges, pageIsLive, stageColor, stageLabel, type DeskFilter, type Page } from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";
import { FilterBar, FilterChip } from "./TableView.tsx";

const { Text, Title } = Typography;
const NODE_H = 72;

type Box = { id: string; x: number; y: number; w: number; h: number };
type Camera = { x: number; y: number; scale: number };

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

function clampScale(scale: number): number {
  return Math.min(2.8, Math.max(0.25, scale));
}

export function GraphView({
  allPages,
  pages,
  filters,
  selectedId,
  onFilter,
  onOpen,
}: {
  allPages: Page[];
  pages: Page[];
  filters: DeskFilter[];
  selectedId: string | null;
  onFilter: (filters: DeskFilter[]) => void;
  onOpen: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const compact = useCompact();
  const placed = layout(pages);
  const relation = edges(pages);
  const byId = new Map(pages.map((page) => [page.id, page]));
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, scale: 1 });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; midX: number; midY: number; camera: Camera } | null>(null);
  const pan = useRef<{ x: number; y: number; camera: Camera } | null>(null);
  const moved = useRef(false);
  const lastDragAt = useRef(0);

  const apply = (next: Camera) => {
    const cameraNext = { ...next, scale: clampScale(next.scale) };
    cameraRef.current = cameraNext;
    setCamera(cameraNext);
  };

  useEffect(() => {
    if (!compact) {
      apply({ x: 0, y: 0, scale: 1 });
      return;
    }
    const node = viewportRef.current;
    if (!node) return;
    const width = node.clientWidth || 360;
    const scale = clampScale(Math.min(1, (width - 16) / placed.width));
    apply({ x: 8, y: 8, scale });
  }, [compact, placed.width, placed.height, pages.length]);

  const localPoint = (event: ReactPointerEvent | PointerEvent) => {
    const node = viewportRef.current;
    if (!node) return { x: event.clientX, y: event.clientY };
    const rect = node.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const beginGesture = () => {
    moved.current = false;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!compact) return;
    beginGesture();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = localPoint(event);
    pointers.current.set(event.pointerId, point);
    moved.current = false;
    if (pointers.current.size === 1) {
      pan.current = { ...point, camera: cameraRef.current };
      pinch.current = null;
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinch.current = {
        dist: dist || 1,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
        camera: cameraRef.current,
      };
      pan.current = null;
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!compact || !pointers.current.has(event.pointerId)) return;
    const point = localPoint(event);
    const prev = pointers.current.get(event.pointerId);
    if (prev && Math.hypot(point.x - prev.x, point.y - prev.y) > 6) {
      moved.current = true;
      lastDragAt.current = Date.now();
    }
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 2 && pinch.current) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const start = pinch.current;
      const scale = clampScale(start.camera.scale * (dist / start.dist));
      const cx = (start.midX - start.camera.x) / start.camera.scale;
      const cy = (start.midY - start.camera.y) / start.camera.scale;
      apply({ scale, x: midX - cx * scale, y: midY - cy * scale });
      return;
    }
    if (pointers.current.size === 1 && pan.current) {
      const start = pan.current;
      apply({
        ...start.camera,
        x: start.camera.x + (point.x - start.x),
        y: start.camera.y + (point.y - start.y),
      });
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      const remaining = [...pointers.current.entries()][0];
      if (remaining) pan.current = { ...remaining[1], camera: cameraRef.current };
    } else pan.current = null;
  };

  const openNode = (id: string) => {
    if (compact && Date.now() - lastDragAt.current < 250) return;
    onOpen(id);
  };

  return (
    <>
      <Title level={4} style={{ margin: 0 }}>
        Tower
      </Title>
      <Text type="secondary">Same pages as the table. The filter hides rows and the edges that used them.</Text>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FilterBar pages={allPages} filters={filters} onChange={onFilter} />
        </div>
        <SpaceLegend />
      </div>
      <div
        data-testid="graph"
        ref={viewportRef}
        onPointerDown={compact ? onPointerDown : undefined}
        onPointerMove={compact ? onPointerMove : undefined}
        onPointerUp={compact ? onPointerUp : undefined}
        onPointerCancel={compact ? onPointerUp : undefined}
        style={{
          position: "relative",
          height: compact ? "min(70dvh, 560px)" : placed.height,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          overflow: compact ? "hidden" : "auto",
          touchAction: compact ? "none" : "auto",
        }}
      >
        <div
          data-testid="graph-canvas"
          style={{
            position: "relative",
            width: placed.width,
            height: placed.height,
            transform: compact ? `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` : undefined,
            transformOrigin: "0 0",
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
            const selected = page.id === selectedId;
            return (
              <button
                key={page.id}
                type="button"
                data-testid={`node-${page.id}`}
                onClick={() => openNode(page.id)}
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
                  border: selected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  padding: "8px 10px",
                  boxShadow: selected ? `0 0 0 2px ${token.colorPrimaryBorder}` : token.boxShadowTertiary,
                  color: token.colorText,
                  touchAction: compact ? "none" : "auto",
                }}
              >
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {pageIsLive(page) ? <Spin size="small" /> : null}
                  <FilterChip
                    field="Type"
                    value={page.type}
                    color={page.type === "Initiative" ? "blue" : "default"}
                    filters={filters}
                    onFilter={onFilter}
                  />
                  <FilterChip field="Stage" value={stageLabel(page.stage)} color={stageColor(page.stage)} filters={filters} onFilter={onFilter} />
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
      </div>
    </>
  );
}

function SpaceLegend() {
  const { token } = theme.useToken();
  return (
    <span style={{ display: "inline-flex", gap: 16, marginLeft: 16, flexWrap: "wrap" }}>
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
