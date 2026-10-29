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
        <Space size={8}>
          <Select
            size="small"
            value={field}
            style={{ width: 130 }}
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
            style={{ width: 220 }}
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
  return (
    <>
      <Title level={4} style={{ margin: 0 }}>
        Tower
      </Title>
      <FilterBar pages={pages} filters={filters} onChange={onFilter} />
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
      <Text type="secondary" style={{ display: "block", marginTop: 8 }} data-testid="page-count">
        {pages.length} pages
      </Text>
    </>
  );
}
