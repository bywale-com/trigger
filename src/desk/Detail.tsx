import { Alert, Button, Tag, Typography, theme } from "antd";
import type { ReactNode } from "react";
import { leaseActive, stageColor, stageLabel, updatedLabel, type Page } from "../observe/snapshot.ts";

const { Text, Title, Paragraph } = Typography;
const roles = ["Architect", "Analyst", "Engineer"] as const;

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "7px 0" }}>
      <Text type="secondary">{label}</Text>
      <div>{children}</div>
    </div>
  );
}

export function Detail({
  page,
  readAt,
  onBack,
  onOpen,
}: {
  page: Page;
  readAt: string;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const running = page.execution.endsWith("· running");
  const runningRole = roles.find((role) => page.execution.startsWith(`${role} · running`));
  return (
    <div data-testid="detail" style={{ maxWidth: 880 }}>
      <Button type="text" onClick={onBack} style={{ paddingInline: 0 }}>
        ← Tower
      </Button>
      <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
        {page.type} · {page.id}
        {page.type === "Packet" ? ` · ${page.initiativeId}` : ` · ${page.module}`}
      </Text>
      <Title level={2} style={{ marginTop: 4 }}>
        {page.name}
      </Title>
      <div style={{ borderTop: `1px solid ${token.colorSplit}`, marginTop: 8 }}>
        <Property label="Stage">
          <Tag color={stageColor(page.stage)}>{stageLabel(page.stage)}</Tag>
        </Property>
        {page.type === "Initiative" ? <Property label="Queue">{page.queue}</Property> : null}
        {page.type === "Packet" ? <Property label="Wake">{page.wake}</Property> : null}
        {page.type === "Packet" ? <Property label="Release">{page.release ?? "—"}</Property> : null}
        <Property label="Execution">
          {running ? <Tag color="processing">{page.execution}</Tag> : page.execution}
        </Property>
        {page.type === "Initiative" ? (
          <Property label="Depends on">{page.dependsOn[0] ?? "—"}</Property>
        ) : null}
        {page.type === "Initiative" ? (
          <Property label="Depended on by">{page.dependedOnBy.length ? page.dependedOnBy.join(", ") : "—"}</Property>
        ) : null}
        {page.type === "Packet" ? <Property label="Inside">{page.inside}</Property> : null}
        {page.type === "Packet" ? <Property label="Integrated SHA">{page.integratedSha ?? "none"}</Property> : null}
        {page.type === "Initiative" ? <Property label="Updated">{updatedLabel(page.updatedAt)}</Property> : null}
        {running && page.dispatch ? (
          <>
            <Property label="Effect">{page.dispatch.effect}</Property>
            <Property label="Label">{page.dispatch.label}</Property>
          </>
        ) : null}
        {running
          ? roles
              .filter((role) => role !== runningRole)
              .filter((role) => !roleLeased(page, role, readAt))
              .map((role) => (
                <Property key={role} label={role}>
                  No open lease
                </Property>
              ))
          : null}
        {page.type === "Initiative" && page.blockedReason ? <Property label="Packets">{String(page.packetIds.length)}</Property> : null}
      </div>
      {page.type === "Initiative" && page.blockedReason ? (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          showIcon
          message="Blocked reason"
          description={page.blockedReason}
        />
      ) : null}
      {page.type === "Initiative" ? (
        <>
          <Title level={5}>Obligation</Title>
          <Paragraph>{page.obligation}</Paragraph>
          <Title level={5}>Specification</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{page.specificationText}</Paragraph>
          <Text type="secondary">{page.specificationPath}</Text>
          <Title level={5}>Outstanding</Title>
          {page.outstanding.length ? page.outstanding.map((line) => <Paragraph key={line}>{line}</Paragraph>) : <Paragraph>—</Paragraph>}
          <Title level={5}>Journal</Title>
          {page.journals.length ? (
            page.journals.map((journal) => (
              <div key={journal.path}>
                <Paragraph style={{ whiteSpace: "pre-wrap" }}>{journal.text}</Paragraph>
                <Text type="secondary">{journal.path}</Text>
              </div>
            ))
          ) : (
            <Paragraph>—</Paragraph>
          )}
          <Title level={5}>Contained pages</Title>
          {page.packetIds.length ? (
            page.packetIds.map((id) => (
              <div key={id}>
                <Button type="link" style={{ paddingInline: 0 }} onClick={() => onOpen(id)}>
                  {id}
                </Button>
              </div>
            ))
          ) : (
            <Paragraph>0</Paragraph>
          )}
        </>
      ) : (
        <>
          <Title level={5}>Intended behavior</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{page.intendedBehavior}</Paragraph>
          {page.intendedBehaviorPath ? <Text type="secondary">{page.intendedBehaviorPath}</Text> : null}
          <Title level={5}>Verification</Title>
          {page.checks.map((check) => (
            <Paragraph key={check.runId}>
              {check.name} · {check.outcome} · {check.runId}
            </Paragraph>
          ))}
          {page.verifiedSha ? <Text type="secondary">Verified SHA {page.verifiedSha}</Text> : null}
        </>
      )}
    </div>
  );
}

function roleLeased(page: Page, role: (typeof roles)[number], readAt: string): boolean {
  if (page.type !== "Packet" || !page.lease) return false;
  return page.lease.role === role.toLowerCase() && leaseActive(page.lease, readAt);
}
