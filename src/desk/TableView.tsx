import { FileTextOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Select, Space, Table, Tag, Typography, theme } from "antd";
import { useState } from "react";
import {
  stageColor,
  stageLabel,
  updatedLabel,
  type DeskFilter,
  type Page,
} from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";

const { Text, Title } = Typography;

const fields: DeskFilter["field"][] = ["Type", "Module", "Stage", "Inside", "Depends on"];

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
              onChange([...filters.filter((item) => item.field !== field), { field, value }]);
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
          onClose={() => onChange(filters.filter((item) => item !== filter))}
        >
          {filter.field} is {filter.value}
        </Tag>
      ))}
    </div>
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

function Relation({ value }: { value: string | null }) {
  const { token } = theme.useToken();
  if (!value) return <Text type="secondary">—</Text>;
  return <Text style={{ color: token.colorPrimary }}>{value}</Text>;
}

function WorkList({ pages, onOpen }: { pages: Page[]; onOpen: (id: string) => void }) {
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
        return (
          <button
            key={page.id}
            type="button"
            data-testid={`row-${page.id}`}
            onClick={() => onOpen(page.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "18px minmax(0, 1fr) auto",
              gap: 8,
              width: "100%",
              minHeight: 52,
              margin: 0,
              padding: "8px 4px",
              border: "none",
              borderBottom: `1px solid ${token.colorSplit}`,
              background: "transparent",
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
                <Tag color={page.type === "Initiative" ? "blue" : "default"} style={{ marginInlineEnd: 0 }}>
                  {page.type}
                </Tag>
                <Tag color={stageColor(page.stage)} style={{ marginInlineEnd: 0 }}>
                  {stageLabel(page.stage)}
                </Tag>
              </span>
              <Text style={{ fontSize: 12, textAlign: "right" }}>{page.execution}</Text>
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
  onFilter,
  onOpen,
}: {
  pages: Page[];
  filters: DeskFilter[];
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
        <WorkList pages={pages} onOpen={onOpen} />
      ) : (
        <Table
          size="small"
          pagination={false}
          dataSource={pages}
          rowKey="id"
          tableLayout="fixed"
          data-testid="database"
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
              render: (type: Page["type"]) => <Tag color={type === "Initiative" ? "blue" : "default"}>{type}</Tag>,
            },
            { title: "Module", dataIndex: "module", width: 196 },
            {
              title: "Stage",
              dataIndex: "stage",
              width: 112,
              render: (stage: string) => <Tag color={stageColor(stage)}>{stageLabel(stage)}</Tag>,
            },
            { title: "Execution", dataIndex: "execution", width: 156 },
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
              render: (value: string | null) => <Relation value={value} />,
            },
            {
              title: "Depends on",
              width: 140,
              render: (_, page) => <Relation value={page.dependsOn.length ? page.dependsOn.join(", ") : null} />,
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
