import { BulbOutlined } from "@ant-design/icons";
import { Layout, Segmented, Space, Spin, Switch, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { shortSha, type FactoryPull } from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";
import { PAGE_GUTTER_COMPACT, PAGE_GUTTER_DESKTOP } from "./place.ts";

const { Header, Content } = Layout;
const { Text, Link } = Typography;

export function Chrome({
  mode,
  onMode,
  view,
  onView,
  refName,
  sha,
  factoryPull,
  revision,
  scopeStatus,
  readFailed,
  refreshing,
  children,
}: {
  mode: "light" | "dark";
  onMode: (mode: "light" | "dark") => void;
  view: "Table" | "Graph";
  onView: (view: "Table" | "Graph") => void;
  refName: string | null;
  sha: string | null;
  factoryPull: FactoryPull | null;
  revision: number | null;
  scopeStatus: string | null;
  readFailed: boolean;
  refreshing: boolean;
  children: ReactNode;
}) {
  const { token } = theme.useToken();
  const compact = useCompact();
  const gutter = compact ? PAGE_GUTTER_COMPACT : PAGE_GUTTER_DESKTOP;
  const source =
    refName && sha ? `Tower · ${refName} ${shortSha(sha)}` : refName ? `Tower · ${refName}` : "Tower";
  const ledger =
    revision != null && scopeStatus ? `Ledger revision ${revision} · scope ${scopeStatus}` : null;
  const live = refreshing ? (
    <span data-testid="desk-refreshing" style={{ display: "inline-flex", alignItems: "center" }}>
      <Spin size="small" />
    </span>
  ) : null;
  const controls = (
    <>
      <Segmented
        options={["Table", "Graph"]}
        value={view}
        onChange={(value) => onView(value as "Table" | "Graph")}
      />
      <Space size={6}>
        <BulbOutlined />
        <Switch
          size="small"
          style={{ minWidth: 64 }}
          checked={mode === "dark"}
          checkedChildren="Dark"
          unCheckedChildren="Light"
          onChange={(checked) => onMode(checked ? "dark" : "light")}
        />
      </Space>
    </>
  );
  const identity = (
    <>
      <Text type="secondary" style={{ overflowWrap: "anywhere" }}>
        {source}
      </Text>
      {factoryPull ? (
        <Link href={factoryPull.url} target="_blank" rel="noreferrer" data-testid="factory-pr">
          PR {factoryPull.number}
        </Link>
      ) : null}
      {ledger ? (
        <Text type="secondary" style={{ overflowWrap: "anywhere" }}>
          {ledger}
        </Text>
      ) : null}
      {live}
      {readFailed ? (
        <Text type="danger" data-testid="read-failed">
          read failed
        </Text>
      ) : null}
    </>
  );
  return (
    <Layout style={{ minHeight: "100dvh" }} data-testid="desk">
      <Header
        data-testid="desk-header"
        style={
          compact
            ? {
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 8,
                height: "auto",
                minHeight: 56,
                lineHeight: "normal",
                paddingBlock: 10,
                paddingInline: gutter,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorSplit}`,
              }
            : {
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorSplit}`,
                paddingInline: gutter,
              }
        }
      >
        {compact ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong style={{ fontSize: 16 }}>
                Trigger
              </Text>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>{controls}</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px" }}>{identity}</div>
          </>
        ) : (
          <>
            <Text strong style={{ fontSize: 16 }}>
              Trigger
            </Text>
            <Text type="secondary">{source}</Text>
            {factoryPull ? (
              <Link href={factoryPull.url} target="_blank" rel="noreferrer" data-testid="factory-pr">
                PR {factoryPull.number}
              </Link>
            ) : null}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
              {ledger ? <Text type="secondary">{ledger}</Text> : null}
              {live}
              {readFailed ? (
                <Text type="danger" data-testid="read-failed">
                  read failed
                </Text>
              ) : null}
              {controls}
            </div>
          </>
        )}
      </Header>
      <Content style={{ background: token.colorBgLayout, padding: gutter }}>{children}</Content>
    </Layout>
  );
}
