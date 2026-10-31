import { FileTextOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Select, Space, Spin, Table, Tag, Typography, theme } from "antd";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import {
  pageIsLive,
  stageColor,
  stageLabel,
  updatedLabel,
  type DeskFilter,
  type Page,
} from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";
import { withFilter } from "./place.ts";

const { Text, Title } = Typography;

const fields: DeskFilter["field"][] = ["Type", "Module", "Stage", "Inside", "Depends on"];

function ExecutionCell({ page }: { page: Page }) {
  if (!pageIsLive(page)) return page.execution;
  return (
    <span data-testid={`live-${page.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Spin size="small" />
      {page.execution}
    </span>
  );
}

export function FilterBar({
  pages,
  filters,
  onChange,
}: {
  pages: Page[];
  filters: DeskFilter[];
  onChange: (filters: DeskFilter[]) => void;
}) {
  const compact = useCompact();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<DeskFilter["field"]>("Type");
  const [value, setValue] = useState("Initiative");
  const choices = choicesFor(pages, field);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
      <Button size="small" icon={<FilterOutlined />} onClick={() => setOpen((current) => !current)}>
        Filter
      </Button>
      {open ? (
        <Space size={8} wrap>
          <Select
            size="small"
            value={field}
            style={{ width: compact ? 110 : 130 }}
            options={fields.map((item) => ({ value: item, label: item }))}
            onChange={(next: DeskFilter["field"]) => {
              setField(next);
              const first = choicesFor(pages, next)[0];
              setValue(first ?? "");
            }}
          />
          <Select
            size="small"
            value={value || undefined}
            style={{ width: compact ? 160 : 220 }}
            options={choices.map((item) => ({ value: item, label: item }))}
            onChange={setValue}
          />
          <Button
            size="small"
            type="primary"
            disabled={!value}
            onClick={() => {
              onChange(withFilter(filters, { field, value }));
              setOpen(false);
            }}
          >
            Add
          </Button>
        </Space>
      ) : null}
      {filters.map((filter) => (
        <Tag
          key={`${filter.field}:${filter.value}`}
          closable
          color="blue"
          data-testid="filter-chip"
          onClose={() => onChange(filters.filter((item) => item !== filter))}
        >
          {filter.field} is {filter.value}
        </Tag>
      ))}
    </div>
  );
}

export function FilterChip({
  field,
  value,
  color,
  filters,
  onFilter,
  children,
}: {
  field: DeskFilter["field"];
  value: string;
  color?: string;
  filters: DeskFilter[];
  onFilter: (filters: DeskFilter[]) => void;
  children?: ReactNode;
}) {
  const active = filters.some((item) => item.field === field && item.value === value);
  return (
    <Tag
      color={color}
      data-testid={`click-filter-${field}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        onFilter(withFilter(filters, { field, value }));
      }}
      style={{ cursor: "pointer", marginInlineEnd: 0, outline: active ? "2px solid var(--ant-color-primary)" : undefined }}
    >
      {children ?? value}
    </Tag>
  );
}

function choicesFor(pages: Page[], field: DeskFilter["field"]): string[] {
  if (field === "Type") return ["Initiative", "Packet"];
  const values = new Set<string>();
  for (const page of pages) {
    if (field === "Module" && page.module) values.add(page.module);
    if (field === "Stage") values.add(stageLabel(page.stage));
    if (field === "Inside" && page.inside) values.add(page.inside);
    if (field === "Depends on") for (const id of page.dependsOn) values.add(id);
  }
  return [...values];
}

export const COLUMN_BASE = {
  name: 220,
  type: 100,
  module: 196,
  stage: 112,
  why: 240,
  next: 220,
  execution: 156,
  evidence: 188,
  inside: 140,
  depends: 140,
  updated: 84,
} as const;

export type BoardColumn = keyof typeof COLUMN_BASE;

/** Drag stays near the designed width. The whole column uses that one width. */
export function columnLimit(base: number, width: number): number {
  const min = Math.round(base * 0.85);
  const max = Math.round(base * 1.15);
  return Math.min(max, Math.max(min, Math.round(width)));
}

function NameCell({ page }: { page: Page }) {
  return (
    <span className="desk-name">
      <FileTextOutlined style={{ color: "var(--ant-color-text-secondary)", flex: "0 0 auto" }} />
      <span className="desk-name-copy">
        <span className="desk-name-title">{page.name}</span>
        <Text type="secondary" className="desk-name-id" style={{ fontSize: 12 }}>
          {page.id}
        </Text>
      </span>
    </span>
  );
}

function FilterText({
  field,
  value,
  filters,
  onFilter,
}: {
  field: DeskFilter["field"];
  value: string | null;
  filters: DeskFilter[];
  onFilter: (filters: DeskFilter[]) => void;
}) {
  const { token } = theme.useToken();
  if (!value) return <Text type="secondary">—</Text>;
  return (
    <button
      type="button"
      data-testid={`click-filter-${field}`}
      onClick={(event) => {
        event.stopPropagation();
        onFilter(withFilter(filters, { field, value }));
      }}
      style={{
        padding: 0,
        border: "none",
        background: "none",
        color: token.colorPrimary,
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
      }}
    >
      {value}
    </button>
  );
}

function ColumnTitle({
  label,
  column,
  width,
  onWidth,
}: {
  label: string;
  column: BoardColumn;
  width: number;
  onWidth: (column: BoardColumn, next: number) => void;
}) {
  const base = COLUMN_BASE[column];
  const min = Math.round(base * 0.85);
  const max = Math.round(base * 1.15);
  return (
    <>
      {label}
      <span
        className="desk-col-resize"
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={width}
        tabIndex={0}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.stopPropagation();
          const startX = event.clientX;
          const startW = width;
          document.body.classList.add("desk-col-resizing");
          const move = (ev: PointerEvent) => onWidth(column, columnLimit(base, startW + ev.clientX - startX));
          const end = () => {
            document.body.classList.remove("desk-col-resizing");
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", end);
          window.addEventListener("pointercancel", end);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          onWidth(column, columnLimit(base, width + (event.key === "ArrowRight" ? 8 : -8)));
        }}
      />
    </>
  );
}

export function TableView({
  pages,
  filters,
  selectedId,
  onFilter,
  onOpen,
}: {
  pages: Page[];
  filters: DeskFilter[];
  selectedId: string | null;
  onFilter: (filters: DeskFilter[]) => void;
  onOpen: (id: string) => void;
}) {
  const [widths, setWidths] = useState(COLUMN_BASE);
  const setWidth = (column: BoardColumn, next: number) => {
    setWidths((current) => (current[column] === next ? current : { ...current, [column]: next }));
  };
  const scrollX = (Object.keys(COLUMN_BASE) as BoardColumn[]).reduce((sum, column) => sum + widths[column], 0);
  const title = (label: string, column: BoardColumn) => (
    <ColumnTitle label={label} column={column} width={widths[column]} onWidth={setWidth} />
  );
  return (
    <>
      <Title level={4} style={{ margin: 0 }}>
        Tower
      </Title>
      <FilterBar pages={pages} filters={filters} onChange={onFilter} />
      <div className="desk-board" data-testid="database">
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={pages}
          rowKey="id"
          tableLayout="fixed"
          scroll={{ x: scrollX }}
          rowClassName={(page) => (page.id === selectedId ? "desk-row-selected" : "")}
          onRow={(page) => ({
            onClick: () => onOpen(page.id),
            style: { cursor: "pointer" },
            "data-testid": `row-${page.id}`,
          })}
          columns={[
            {
              title: title("Name", "name"),
              dataIndex: "name",
              width: widths.name,
              render: (_, page) => <NameCell page={page} />,
            },
            {
              title: title("Type", "type"),
              dataIndex: "type",
              width: widths.type,
              render: (type: Page["type"]) => (
                <FilterChip field="Type" value={type} color={type === "Initiative" ? "blue" : "default"} filters={filters} onFilter={onFilter} />
              ),
            },
            {
              title: title("Module", "module"),
              dataIndex: "module",
              width: widths.module,
              render: (module: string) => <FilterText field="Module" value={module} filters={filters} onFilter={onFilter} />,
            },
            {
              title: title("Stage", "stage"),
              dataIndex: "stage",
              width: widths.stage,
              render: (stage: string) => (
                <FilterChip field="Stage" value={stageLabel(stage)} color={stageColor(stage)} filters={filters} onFilter={onFilter} />
              ),
            },
            {
              title: title("Why", "why"),
              dataIndex: "why",
              width: widths.why,
              ellipsis: true,
              render: (value: string) => (
                <span className="desk-sentence" title={value}>
                  {value}
                </span>
              ),
            },
            {
              title: title("Next", "next"),
              dataIndex: "next",
              width: widths.next,
              ellipsis: true,
              render: (value: string) => (
                <span className="desk-sentence" title={value}>
                  {value}
                </span>
              ),
            },
            {
              title: title("Execution", "execution"),
              dataIndex: "execution",
              width: widths.execution,
              render: (_: string, page: Page) => <ExecutionCell page={page} />,
            },
            {
              title: title("Evidence", "evidence"),
              dataIndex: "evidence",
              width: widths.evidence,
              render: (value: string, page) => (page.evidenceError ? <Tag color="error">{value}</Tag> : value),
            },
            {
              title: title("Inside", "inside"),
              dataIndex: "inside",
              width: widths.inside,
              render: (value: string | null) => <FilterText field="Inside" value={value} filters={filters} onFilter={onFilter} />,
            },
            {
              title: title("Depends on", "depends"),
              width: widths.depends,
              render: (_, page) =>
                page.dependsOn.length ? (
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {page.dependsOn.map((id) => (
                      <FilterText key={id} field="Depends on" value={id} filters={filters} onFilter={onFilter} />
                    ))}
                  </span>
                ) : (
                  <Text type="secondary">—</Text>
                ),
            },
            {
              title: title("Updated", "updated"),
              dataIndex: "updatedAt",
              width: widths.updated,
              render: (value: string | null) => <Text type="secondary">{updatedLabel(value)}</Text>,
            },
          ]}
        />
      </div>
      <Text type="secondary" style={{ display: "block", marginTop: 8 }} data-testid="page-count">
        {pages.length} pages
      </Text>
    </>
  );
}
