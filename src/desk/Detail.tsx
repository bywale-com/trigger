import { Alert, Button, Image, Popover, Space, Spin, Tabs, Tag, Typography, theme } from "antd";
import type { ReactNode } from "react";
import {
  pageIsLive,
  platesVisible,
  shortSha,
  stageColor,
  stageLabel,
  updatedLabel,
  type DeskFilter,
  type EvidencePresence,
  type GithubEvidence,
  type LifecycleStep,
  type PacketPlates,
  type Page,
} from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";
import { FactoryMarkdown } from "./markdown.tsx";
import { neighbors, withFilter } from "./place.ts";
import { FilterChip } from "./TableView.tsx";

const { Text, Title, Paragraph, Link } = Typography;

function Property({ label, children }: { label: string; children: ReactNode }) {
  const compact = useCompact();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : "160px 1fr",
        gap: compact ? 2 : 12,
        padding: "7px 0",
      }}
    >
      <Text type="secondary">{label}</Text>
      <div style={{ overflowWrap: "anywhere" }}>{children}</div>
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
      <div data-testid="lifecycle" data-section="lifecycle" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {steps.map((step) => (
          <Popover key={step.id} content={step.basis} trigger="click">
            <Tag color={lifecycleColor(step.presence)} title={step.basis} data-testid={`lifecycle-${step.id}`} style={{ cursor: "pointer" }}>
              {step.label} {step.presence}
            </Tag>
          </Popover>
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

function Plates({ plates }: { plates: PacketPlates }) {
  const { token } = theme.useToken();
  if (!platesVisible(plates)) return null;
  const frame = {
    display: "block" as const,
    width: "100%",
    height: "auto",
    maxWidth: "100%",
    borderRadius: 6,
    border: `1px solid ${token.colorSplit}`,
  };
  return (
    <>
      <Title level={5}>Plates</Title>
      <div data-testid="plates">
        {plates.images.map((image) => (
          <div key={image.path} data-testid="plate-image" style={{ marginBottom: 16, width: "100%" }}>
            <Image src={image.imageUrl} alt={image.alt} style={frame} />
            <Link href={image.artifactUrl} target="_blank" rel="noreferrer" style={{ overflowWrap: "anywhere" }}>
              {image.path}
            </Link>
          </div>
        ))}
        {plates.buckets.map((bucket) => (
          <Property key={bucket.id} label={bucket.label}>
            <span data-testid={`plate-bucket-${bucket.id}`} style={{ whiteSpace: "pre-wrap" }}>
              {bucket.text ?? "unavailable"}
            </span>
          </Property>
        ))}
      </div>
    </>
  );
}

function GithubSection({ github, repo }: { github: GithubEvidence; repo: string }) {
  if (!github.available) {
    return (
      <div data-section="github">
        <Title level={5}>GitHub</Title>
        <Paragraph data-testid="github-evidence">unavailable{github.unavailableReason ? ` · ${github.unavailableReason}` : ""}</Paragraph>
      </div>
    );
  }
  return (
    <div data-section="github">
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
            : `${github.merge.merged === true ? "merged" : github.merge.merged === false ? "not merged" : "unknown"}`}
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
    </div>
  );
}

function checkWord(outcome: string | null): string {
  const value = (outcome ?? "").toLowerCase();
  if (value === "failure" || value === "failed") return "failed";
  return outcome ?? "Unknown";
}

function ReleaseReview({
  page,
  pages,
  repo,
}: {
  page: Extract<Page, { type: "Packet" }>;
  pages: Page[];
  repo: string;
}) {
  const release = page.ledgerRelease;
  if (!release || release.prNumber == null) return null;
  const initiative = pages.find((item) => item.type === "Initiative" && item.id === page.initiativeId);
  const dependencies = page.siblings.filter((link) => link.basis === "dependency");
  const pullChecks = page.github.checks.filter((check) => check.source === "github");
  return (
    <div data-testid="release-review" data-section="review">
      <Title level={5}>Review</Title>
      <Property label="Pull request">
        {release.prUrl ? (
          <Link href={release.prUrl} target="_blank" rel="noreferrer" data-testid="release-pr">
            PR {release.prNumber}
          </Link>
        ) : (
          <span data-testid="release-pr">PR {release.prNumber}</span>
        )}
      </Property>
      <div data-section="specification">
        <Title level={5}>Specification</Title>
        <FactoryMarkdown
          text={initiative && initiative.type === "Initiative" ? initiative.specificationText : null}
          testId="review-specification"
          stripTitle
        />
      </div>
      <Property label="Changes">
        {page.github.files.length ? (
          page.github.files.map((file) => (
            <div key={file.filename} data-testid="release-file">
              {file.filename}
              {file.status ? ` · ${file.status}` : ""}
            </div>
          ))
        ) : (
          <Text>{page.github.available ? "—" : "Unknown"}</Text>
        )}
      </Property>
      <Property label="Ledger checks">
        {page.checks.length
          ? page.checks.map((check) => (
              <div key={`${check.name}-${check.runId}`}>
                {check.name} · {check.outcome} ·{" "}
                {check.runId ? (
                  <Link href={`https://github.com/${repo}/actions/runs/${check.runId}`} target="_blank" rel="noreferrer">
                    {check.runId}
                  </Link>
                ) : (
                  "—"
                )}
              </div>
            ))
          : "—"}
      </Property>
      <Property label="Pull request checks">
        {!page.github.available ? (
          "Unknown"
        ) : pullChecks.length ? (
          pullChecks.map((check) => (
            <div key={`${check.name}-${check.runId ?? check.outcome}`} data-testid="pull-check">
              {check.name} · {checkWord(check.outcome)}
            </div>
          ))
        ) : (
          "—"
        )}
      </Property>
      <Property label="Dependencies">{dependencies.length ? dependencies.map((link) => link.id).join(", ") : "—"}</Property>
      {release.prUrl ? (
        <Button data-testid="merge-release" href={release.prUrl} target="_blank" rel="noreferrer">
          Merge
        </Button>
      ) : (
        <Button data-testid="merge-release" onClick={(event) => event.preventDefault()}>
          Merge
        </Button>
      )}
    </div>
  );
}

function jumpTo(key: string) {
  const node = document.querySelector(`[data-section="${key}"]`);
  if (node instanceof HTMLElement) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Detail({
  page,
  pages,
  repo,
  onBack,
  onOpen,
  onFilter,
  filters,
}: {
  page: Page;
  pages: Page[];
  readAt: string;
  repo: string;
  onBack: () => void;
  onOpen: (id: string) => void;
  onFilter: (filters: DeskFilter[]) => void;
  filters: DeskFilter[];
}) {
  const { token } = theme.useToken();
  const running = pageIsLive(page);
  const walk = neighbors(pages, page);
  const packetTabs = [
    { key: "page", label: "Page" },
    { key: "intended", label: "Intended" },
    { key: "lifecycle", label: "Lifecycle" },
    { key: "evidence", label: "Evidence" },
    { key: "github", label: "GitHub" },
  ];
  const initiativeTabs = [
    { key: "page", label: "Page" },
    { key: "specification", label: "Specification" },
    { key: "journal", label: "Journal" },
    { key: "github", label: "GitHub" },
  ];
  return (
    <div data-testid="detail">
      <nav data-testid="crumb" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Button type="text" onClick={onBack} style={{ paddingInline: 0 }}>
          ← Tower
        </Button>
        {page.type === "Packet" ? (
          <>
            <Text type="secondary">/</Text>
            <Button type="link" style={{ paddingInline: 0 }} onClick={() => onOpen(page.initiativeId)}>
              {page.initiativeId}
            </Button>
            <Text type="secondary">/</Text>
            <Text>{page.id}</Text>
          </>
        ) : (
          <>
            <Text type="secondary">/</Text>
            <Text>{page.id}</Text>
          </>
        )}
      </nav>
      <Space size={8} style={{ marginBottom: 8 }}>
        <Button size="small" disabled={!walk.prev} data-testid="page-prev" onClick={() => walk.prev && onOpen(walk.prev.id)}>
          Previous
        </Button>
        <Button size="small" disabled={!walk.next} data-testid="page-next" onClick={() => walk.next && onOpen(walk.next.id)}>
          Next
        </Button>
      </Space>
      <Tabs
        size="small"
        data-testid="page-jumps"
        items={(page.type === "Packet" ? packetTabs : initiativeTabs).map((item) => ({ ...item, children: null }))}
        onChange={jumpTo}
        style={{ marginBottom: 8 }}
      />
      <div data-section="page">
        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
          {page.type} · {page.id}
          {page.type === "Packet" ? ` · ${page.initiativeId}` : ` · ${page.module}`}
        </Text>
        <Title level={2} style={{ marginTop: 4, overflowWrap: "anywhere" }}>
          {page.name}
        </Title>
      </div>
      <div style={{ borderTop: `1px solid ${token.colorSplit}`, marginTop: 8 }}>
        <Property label="Why">{page.why}</Property>
        <Property label="Next">{page.next}</Property>
        <Property label="Who">{page.who}</Property>
        <Property label="Happening">{page.happening}</Property>
        <Property label="Stage">
          <FilterChip field="Stage" value={stageLabel(page.stage)} color={stageColor(page.stage)} filters={filters} onFilter={onFilter} />
        </Property>
        {page.type === "Initiative" ? <Property label="Queue">{page.queue}</Property> : null}
        {page.type === "Packet" ? <Property label="Wake">{page.wake}</Property> : null}
        {page.type === "Packet" ? <Property label="Release">{page.release ?? "—"}</Property> : null}
        <Property label="Execution">
          {running ? (
            <span data-testid="running-spin" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Spin size="small" />
              <Tag color="processing">{page.execution}</Tag>
            </span>
          ) : (
            page.execution
          )}
        </Property>
        <Lifecycle steps={page.lifecycle} />
        {page.type === "Initiative" ? (
          <Property label="Depends on">
            {page.dependsOn[0] ? (
              <Button
                type="link"
                style={{ paddingInline: 0 }}
                onClick={() => onFilter(withFilter(filters, { field: "Depends on", value: page.dependsOn[0]! }))}
              >
                {page.dependsOn[0]}
              </Button>
            ) : (
              "—"
            )}
          </Property>
        ) : null}
        {page.type === "Initiative" ? (
          <Property label="Depended on by">{page.dependedOnBy.length ? page.dependedOnBy.join(", ") : "—"}</Property>
        ) : null}
        {page.type === "Packet" ? (
          <Property label="Inside">
            {page.inside ? (
              <Button type="link" data-testid="inside-link" style={{ paddingInline: 0 }} onClick={() => onOpen(page.inside!)}>
                {page.inside}
              </Button>
            ) : (
              "—"
            )}
          </Property>
        ) : null}
        {page.type === "Packet" ? <Property label="Integrated SHA">{page.integratedSha ?? "none"}</Property> : null}
        {page.type === "Initiative" ? <Property label="Updated">{updatedLabel(page.updatedAt)}</Property> : null}
        {running && page.dispatch ? (
          <>
            <Property label="Effect">{page.dispatch.effect}</Property>
            <Property label="Label">{page.dispatch.label}</Property>
          </>
        ) : null}
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
          <div data-section="specification">
            <Title level={5}>Specification</Title>
            <FactoryMarkdown text={page.specificationText} testId="specification-prose" stripTitle />
            <Text type="secondary">{page.specificationPath}</Text>
          </div>
          <Title level={5}>Outstanding</Title>
          {page.outstanding.length ? page.outstanding.map((line) => <Paragraph key={line}>{line}</Paragraph>) : <Paragraph>—</Paragraph>}
          <div data-section="journal">
            <Title level={5}>Journal</Title>
            {page.journals.length ? (
              page.journals.map((journal) => (
                <div key={journal.path}>
                  <FactoryMarkdown text={journal.text} testId="journal-prose" />
                  <Text type="secondary">{journal.path}</Text>
                </div>
              ))
            ) : (
              <Paragraph>—</Paragraph>
            )}
          </div>
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
          <div data-section="intended">
            <Title level={5}>Intended behavior</Title>
            <FactoryMarkdown text={page.intendedBehavior} testId="intended-prose" />
            {page.intendedBehaviorPath ? <Text type="secondary">{page.intendedBehaviorPath}</Text> : null}
          </div>
          <Plates plates={page.plates} />
          <div data-section="evidence">
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
          </div>
          {page.ledgerRelease?.prNumber != null && !page.ledgerRelease.mergeSha ? (
            <ReleaseReview page={page} pages={pages} repo={repo} />
          ) : null}
          <GithubSection github={page.github} repo={repo} />
        </>
      )}
    </div>
  );
}
