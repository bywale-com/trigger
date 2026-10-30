import { Alert, Button, Tag, Typography, theme } from "antd";
import type { ReactNode } from "react";
import {
  leaseActive,
  shortSha,
  stageColor,
  stageLabel,
  updatedLabel,
  type EvidencePresence,
  type GithubEvidence,
  type LifecycleStep,
  type Page,
} from "../observe/snapshot.ts";

const { Text, Title, Paragraph, Link } = Typography;
const roles = ["Architect", "Analyst", "Engineer"] as const;

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "7px 0" }}>
      <Text type="secondary">{label}</Text>
      <div>{children}</div>
    </div>
  );
}

function lifecycleColor(presence: EvidencePresence): "success" | "processing" | "default" {
  if (presence === "yes") return "success";
  if (presence === "unknown") return "processing";
  return "default";
}

function Lifecycle({ steps }: { steps: LifecycleStep[] }) {
  return (
    <Property label="Lifecycle">
      <div data-testid="lifecycle" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {steps.map((step) => (
          <Tag key={step.id} color={lifecycleColor(step.presence)} title={step.basis} data-testid={`lifecycle-${step.id}`}>
            {step.label} {step.presence}
          </Tag>
        ))}
      </div>
    </Property>
  );
}

function ShaLink({ sha, repo }: { sha: string | null; repo?: string }) {
  if (!sha) return <Text>unavailable</Text>;
  const href = `https://github.com/${repo ?? "bywale-com/omcoda_tower"}/commit/${sha}`;
  return (
    <Link href={href} target="_blank" rel="noreferrer">
      {sha}
    </Link>
  );
}

function GithubSection({ github, repo }: { github: GithubEvidence; repo: string }) {
  if (!github.available) {
    return (
      <>
        <Title level={5}>GitHub</Title>
        <Paragraph data-testid="github-evidence">unavailable{github.unavailableReason ? ` · ${github.unavailableReason}` : ""}</Paragraph>
      </>
    );
  }
  return (
    <>
      <Title level={5}>GitHub</Title>
      <div data-testid="github-evidence" style={{ borderTop: "1px solid transparent" }}>
        <Property label="Working branch">{github.workingBranch ?? "unavailable"}</Property>
        <Property label="Pull request">
          {github.pull ? (
            <Link href={github.pull.url} target="_blank" rel="noreferrer">
              PR {github.pull.number} · {github.pull.state}
              {github.pull.merged ? " · merged" : ""}
            </Link>
          ) : (
            "unavailable"
          )}
        </Property>
        <Property label="Latest commit">
          {github.latestSha ? <ShaLink sha={github.latestSha} repo={repo} /> : "unavailable"}
        </Property>
        <Property label="Commits">
          {github.commits.length ? (
            github.commits.map((commit) => (
              <div key={commit.sha}>
                <Link href={commit.url} target="_blank" rel="noreferrer">
                  {shortSha(commit.sha)}
                </Link>
                {commit.message ? <Text> {commit.message}</Text> : null}
              </div>
            ))
          ) : (
            "unavailable"
          )}
        </Property>
        <Property label="Preview">
          {github.preview ? (
            <Link href={github.preview.url} target="_blank" rel="noreferrer">
              {github.preview.url}
            </Link>
          ) : (
            "unavailable"
          )}
        </Property>
        <Property label="Merge">
          {github.merge.merged == null && !github.merge.url
            ? "unavailable"
            : `${github.merge.merged === true ? "merged" : github.merge.merged === false ? "not merged" : "unknown"}${github.merge.url ? "" : ""}`}
          {github.merge.url ? (
            <>
              {" "}
              <Link href={github.merge.url} target="_blank" rel="noreferrer">
                {github.merge.url}
              </Link>
            </>
          ) : null}
        </Property>
      </div>
    </>
  );
}

export function Detail({
  page,
  readAt,
  repo,
  onBack,
  onOpen,
}: {
  page: Page;
  readAt: string;
  repo: string;
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
        <Lifecycle steps={page.lifecycle} />
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
          <GithubSection github={page.github} repo={repo} />
        </>
      ) : (
        <>
          <Title level={5}>Intended behavior</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{page.intendedBehavior}</Paragraph>
          {page.intendedBehaviorPath ? <Text type="secondary">{page.intendedBehaviorPath}</Text> : null}
          <Title level={5}>Verification</Title>
          {page.checks.map((check) => (
            <Paragraph key={check.runId}>
              {check.name} · {check.outcome} ·{" "}
              {check.runId ? (
                <Link href={`https://github.com/${repo}/actions/runs/${check.runId}`} target="_blank" rel="noreferrer">
                  {check.runId}
                </Link>
              ) : (
                "—"
              )}
            </Paragraph>
          ))}
          {page.verifiedSha ? <Text type="secondary">Verified SHA {page.verifiedSha}</Text> : null}
          <Title level={5}>Execution evidence</Title>
          {page.dispatch ? (
            <>
              <Property label="Effect">{page.dispatch.effect}</Property>
              <Property label="Label">{page.dispatch.label}</Property>
              <Property label="Authorized SHA">
                <ShaLink sha={page.dispatch.prHead} repo={repo} />
              </Property>
              {page.dispatch.issuedAt ? <Property label="Issued">{page.dispatch.issuedAt}</Property> : null}
            </>
          ) : (
            <Paragraph>No current dispatch</Paragraph>
          )}
          {page.dispatchHistory.length ? (
            page.dispatchHistory.map((record, index) => (
              <Paragraph key={`${record.prHead}-${index}`}>
                {record.effect} · {record.workerExecution ?? "unknown"} · {shortSha(record.prHead)}
              </Paragraph>
            ))
          ) : (
            <Paragraph>No dispatch history</Paragraph>
          )}
          <GithubSection github={page.github} repo={repo} />
        </>
      )}
    </div>
  );
}

function roleLeased(page: Page, role: (typeof roles)[number], readAt: string): boolean {
  if (page.type !== "Packet" || !page.lease) return false;
  return page.lease.role === role.toLowerCase() && leaseActive(page.lease, readAt);
}
