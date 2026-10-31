import { Button, Tag, Typography, theme } from "antd";
import { useRef, useState } from "react";
import type { FactoryExplanation } from "../observe/tower/explain.ts";
import type { FactoryPulse } from "../observe/tower/pulse.ts";
import type { Page } from "../observe/snapshot.ts";
import { useCompact } from "./compact.ts";

const { Text } = Typography;

export function FactoryPulseBar({
  pulse,
  explanation,
  pages,
  scopeStatus,
  activation,
  onOpen,
}: {
  pulse: FactoryPulse;
  explanation: FactoryExplanation | null;
  pages: Page[];
  readAt: string;
  scopeStatus: string | null;
  activation: string | null;
  onOpen?: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const compact = useCompact();
  const summary = explanation?.summary ?? null;
  const inbox = summary?.founderInbox ?? [];
  const intervention = (summary?.intervention ?? []).map((id) => ({
    id,
    why: pages.find((page) => page.id === id)?.why ?? "Unknown",
  }));
  const openable = inbox.length > 0 || intervention.length > 0;
  const [open, setOpen] = useState(false);
  const pull = useRef<{ y: number; moved: boolean } | null>(null);
  const suppress = useRef(false);
  const nameOf = (id: string) => pages.find((page) => page.id === id)?.name ?? id;
  return (
    <div
      data-testid="factory-pulse"
      className="factory-pulse"
      style={{
        marginBottom: 12,
        padding: "8px 0 0",
        borderBottom: `1px solid ${token.colorSplit}`,
      }}
    >
      <div data-testid="pulse-headline" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>
        {summary?.headline ?? "Unknown"}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: compact ? 8 : 10, marginTop: 6 }}>
        <Tag data-testid="pulse-scope" style={{ marginInlineEnd: 0 }}>
          {`scope ${scopeStatus ?? "unset"}`}
        </Tag>
        <Tag data-testid="pulse-activation" style={{ marginInlineEnd: 0 }}>
          {`controller ${activation ?? "unset"}`}
        </Tag>
        {pulse.remaining != null ? (
          <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-remaining">
            {pulse.remaining}/{pulse.authorizedDispatches}
          </Text>
        ) : null}
        <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-cadence">
          {pulse.controllerCadence === "scheduled" && pulse.schedule ? pulse.schedule : "event"}
        </Text>
        {summary?.withheldLanes.length ? (
          <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-withheld">
            {summary.withheldLanes.map((lane) => `${lane} lane off`).join(" · ")}
          </Text>
        ) : null}
        {intervention.length ? (
          <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-intervention-count">
            {intervention.length} intervention
          </Text>
        ) : null}
      </div>
      {openable ? (
        <button
          type="button"
          className="desk-drawer-grab"
          data-testid="pulse-grab"
          aria-expanded={open}
          aria-label="Inbox"
          onPointerDown={(event) => {
            pull.current = { y: event.clientY, moved: false };
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* a synthetic pointer has nothing to capture */
            }
          }}
          onPointerMove={(event) => {
            if (!pull.current) return;
            const delta = event.clientY - pull.current.y;
            if (Math.abs(delta) > 8) pull.current.moved = true;
            if (delta > 28) setOpen(true);
            if (delta < -28) setOpen(false);
          }}
          onPointerUp={() => {
            if (pull.current?.moved) suppress.current = true;
            pull.current = null;
          }}
          onClick={() => {
            if (suppress.current) {
              suppress.current = false;
              return;
            }
            setOpen((current) => !current);
          }}
        >
          <span style={{ background: token.colorTextQuaternary }} />
        </button>
      ) : null}
      {open ? (
        <div data-testid="pulse-detail" style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
          {inbox.map((release) => (
            <div
              key={release.id}
              data-testid={`pulse-release-${release.id}`}
              style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {release.packetIds.map((id) => nameOf(id)).join(", ")}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  PR {release.prNumber}
                </Text>
              </div>
              <Button size="small" data-testid={`pulse-review-${release.packetIds[0]}`} onClick={() => onOpen?.(release.packetIds[0] ?? release.id)}>
                Review
              </Button>
            </div>
          ))}
          {intervention.map((row) => (
            <button
              key={row.id}
              type="button"
              data-testid={`pulse-intervention-${row.id}`}
              onClick={() => onOpen?.(row.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
                margin: 0,
                padding: 0,
                border: "none",
                background: "none",
                color: "inherit",
                cursor: onOpen ? "pointer" : "default",
                textAlign: "left",
              }}
            >
              <span>{nameOf(row.id)}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.why}
              </Text>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
