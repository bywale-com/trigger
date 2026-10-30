import { BulbOutlined } from "@ant-design/icons";
import { Layout, Segmented, Space, Switch, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { shortSha, type FactoryPull } from "../observe/snapshot.ts";

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
  children: ReactNode;
}) {
  const { token } = theme.useToken();
  const source =
    refName && sha ? `Tower · ${refName} ${shortSha(sha)}` : refName ? `Tower · ${refName}` : "Tower";
  const ledger =
    revision != null && scopeStatus ? `Ledger revision ${revision} · scope ${scopeStatus}` : null;
  return (
    <Layout style={{ minHeight: "100vh" }} data-testid="desk">
      <Header
        data-testid="desk-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorSplit}`,
          paddingInline: 20,
        }}
      >
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
          {readFailed ? (
            <Text type="danger" data-testid="read-failed">
              read failed
            </Text>
          ) : null}
          <Segmented
            options={["Table", "Graph"]}
            value={view}
            onChange={(value) => onView(value as "Table" | "Graph")}
          />
          <Space size={6}>
            <BulbOutlined />
            <Switch
              size="small"
              checked={mode === "dark"}
              checkedChildren="Dark"
              unCheckedChildren="Light"
              onChange={(checked) => onMode(checked ? "dark" : "light")}
            />
          </Space>
        </div>
      </Header>
      <Content style={{ background: token.colorBgLayout, padding: 16 }}>{children}</Content>
    </Layout>
  );
}
