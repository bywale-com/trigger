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

function NameCell({ page }: { page: Page }) {
  return (
    <Space size={8}>
      <FileTextOutlined style={{ color: "var(--ant-color-text-secondary)" }} />
      <div>
        <div>{page.name}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {page.id}
        </Text>
      </div>
    </Space>
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
        overflowWrap: "anywhere",
      }}
    >
      {value}
    </button>
  );
}

function WorkList({
  pages,
  selectedId,
  filters,
  onFilter,
  onOpen,
}: {
  pages: Page[];
  selectedId: string | null;
  filters: DeskFilter[];
  onFilter: (filters: DeskFilter[]) => void;
  onOpen: (id: string) => void;
}) {
  const { token } = theme.useToken();
  return (
    <div data-testid="work-list" style={{ borderTop: `1px solid ${token.colorSplit}` }}>
      {pages.map((page) => {
        const meta = [
          page.module || null,
          page.inside ? `Inside ${page.inside}` : page.type === "Packet" ? "Inside —" : null,
          page.dependsOn.length ? `Depends ${page.dependsOn.join(", ")}` : null,
          page.updatedAt ? updatedLabel(page.updatedAt) : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const selected = page.id === selectedId;
        return (
          <button
            key={page.id}
            type="button"
            data-testid={`row-${page.id}`}
            onClick={() => onOpen(page.id)}
            className={selected ? "work-row-selected" : undefined}
            style={{
              display: "grid",
              gridTemplateColumns: "18px minmax(0, 1fr) auto",
              gap: 8,
              width: "100%",
              minHeight: 52,
              margin: 0,
              padding: "8px 8px",
              border: "none",
              borderBottom: `1px solid ${token.colorSplit}`,
              borderLeft: selected ? `3px solid ${token.colorPrimary}` : "3px solid transparent",
              background: selected ? token.colorPrimaryBg : "transparent",
              color: token.colorText,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <FileTextOutlined style={{ color: token.colorTextSecondary, marginTop: 3 }} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {page.name}
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                {page.id}
              </Text>
              {meta ? (
                <Text type="secondary" style={{ fontSize: 12, display: "block", overflowWrap: "anywhere" }}>
                  {meta}
                </Text>
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, minWidth: 0 }}>
              <span style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <FilterChip field="Type" value={page.type} color={page.type === "Initiative" ? "blue" : "default"} filters={filters} onFilter={onFilter} />
                <FilterChip field="Stage" value={stageLabel(page.stage)} color={stageColor(page.stage)} filters={filters} onFilter={onFilter} />
              </span>
              <Text style={{ fontSize: 12, textAlign: "right" }}>
                <ExecutionCell page={page} />
              </Text>
              {page.evidenceError ? (
                <Tag color="error" style={{ marginInlineEnd: 0 }}>
                  {page.evidence}
                </Tag>
              ) : (
                <Text type="secondary" style={{ fontSize: 12, textAlign: "right" }}>
                  {page.evidence}
                </Text>
              )}
            </div>
          </button>
        );
      })}
    </div>
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
  const compact = useCompact();
  return (
    <>
      <Title level={4} style={{ margin: 0 }}>
        Tower
      </Title>
      <FilterBar pages={pages} filters={filters} onChange={onFilter} />
      {compact ? (
        <WorkList pages={pages} selectedId={selectedId} filters={filters} onFilter={onFilter} onOpen={onOpen} />
      ) : (
        <Table
          size="small"
          pagination={false}
          dataSource={pages}
          rowKey="id"
          tableLayout="fixed"
          data-testid="database"
          rowClassName={(page) => (page.id === selectedId ? "desk-row-selected" : "")}
          onRow={(page) => ({
            onClick: () => onOpen(page.id),
            style: { cursor: "pointer" },
          })}
          columns={[
            { title: "Name", dataIndex: "name", width: 220, render: (_, page) => <NameCell page={page} /> },
            {
              title: "Type",
              dataIndex: "type",
              width: 100,
              render: (type: Page["type"]) => (
                <FilterChip field="Type" value={type} color={type === "Initiative" ? "blue" : "default"} filters={filters} onFilter={onFilter} />
              ),
            },
            {
              title: "Module",
              dataIndex: "module",
              width: 196,
              render: (module: string) => <FilterText field="Module" value={module} filters={filters} onFilter={onFilter} />,
            },
            {
              title: "Stage",
              dataIndex: "stage",
              width: 112,
              render: (stage: string) => (
                <FilterChip field="Stage" value={stageLabel(stage)} color={stageColor(stage)} filters={filters} onFilter={onFilter} />
              ),
            },
            {
              title: "Execution",
              dataIndex: "execution",
              width: 156,
              render: (_: string, page: Page) => <ExecutionCell page={page} />,
            },
            {
              title: "Evidence",
              dataIndex: "evidence",
              width: 188,
              render: (value: string, page) => (page.evidenceError ? <Tag color="error">{value}</Tag> : value),
            },
            {
              title: "Inside",
              dataIndex: "inside",
              width: 140,
              render: (value: string | null) => <FilterText field="Inside" value={value} filters={filters} onFilter={onFilter} />,
            },
            {
              title: "Depends on",
              width: 140,
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
              title: "Updated",
              dataIndex: "updatedAt",
              width: 84,
              render: (value: string | null) => <Text type="secondary">{updatedLabel(value)}</Text>,
            },
          ]}
        />
      )}
      <Text type="secondary" style={{ display: "block", marginTop: 8 }} data-testid="page-count">
        {pages.length} pages
      </Text>
    </>
  );
}
