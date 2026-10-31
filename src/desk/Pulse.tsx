import { Spin, Tag, Typography, theme } from "antd";
import { useRef, useState } from "react";
import { compactDuration, type FactoryPulse } from "../observe/tower/pulse.ts";
import { useCompact } from "./compact.ts";

const { Text } = Typography;

export function FactoryPulseBar({
  pulse,
  readAt,
  scopeStatus,
  activation,
  onOpen,
}: {
  pulse: FactoryPulse;
  readAt: string;
  scopeStatus: string | null;
  activation: string | null;
  onOpen?: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const compact = useCompact();
  const live = pulse.live[0];
  const remaining = pulse.remaining;
  const leaseLeft = live?.until ? compactDuration(readAt, live.until) : null;
  const next = pulse.wakes[0];
  const [open, setOpen] = useState(false);
  const pull = useRef<{ y: number; moved: boolean } | null>(null);
  const suppress = useRef(false);
  const waiting = pulse.waits.length > 0;
  return (
    <div
      data-testid="factory-pulse"
      className="factory-pulse"
      style={{
        marginBottom: 12,
        padding: compact ? "8px 0 0" : "8px 0 0",
        borderBottom: `1px solid ${token.colorSplit}`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: compact ? 8 : 10 }}>
        {live ? (
          <span data-testid="pulse-live" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Spin size="small" />
            <Tag color="processing" style={{ marginInlineEnd: 0 }}>
              {live.role}
            </Tag>
            {leaseLeft ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {leaseLeft}
              </Text>
            ) : null}
          </span>
        ) : (
          <span data-testid="pulse-idle" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {waiting ? <Spin size="small" data-testid="pulse-motion" /> : null}
            <Tag data-testid="pulse-unconfirmed" style={{ marginInlineEnd: 0 }}>
              unconfirmed
            </Tag>
          </span>
        )}
        <Tag data-testid="pulse-scope" style={{ marginInlineEnd: 0 }}>
          {`scope ${scopeStatus ?? "unset"}`}
        </Tag>
        <Tag data-testid="pulse-activation" style={{ marginInlineEnd: 0 }}>
          {`controller ${activation ?? "unset"}`}
        </Tag>
        {pulse.reason !== "inactive" ? (
          <Tag data-testid="pulse-reason" style={{ marginInlineEnd: 0 }}>
            {pulse.reason}
          </Tag>
        ) : null}
        {next ? (
          <Tag color="processing" data-testid="pulse-next" style={{ marginInlineEnd: 0 }}>
            {next.effect}
          </Tag>
        ) : null}
        {remaining != null ? (
          <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-remaining">
            {remaining}/{pulse.authorizedDispatches}
          </Text>
        ) : null}
        <Text type="secondary" style={{ fontSize: 12 }} data-testid="pulse-cadence">
          {pulse.controllerCadence === "scheduled" && pulse.schedule ? pulse.schedule : "event"}
        </Text>
        {waiting ? (
          <Tag data-testid="pulse-wait-count" style={{ marginInlineEnd: 0 }}>
            {pulse.waits.length}
          </Tag>
        ) : null}
      </div>
      {waiting ? (
        <button
          type="button"
          className="desk-drawer-grab"
          data-testid="pulse-grab"
          aria-expanded={open}
          aria-label="Running"
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
        <div
          data-testid="pulse-detail"
          style={{
            display: "flex",
            flexDirection: compact ? "column" : "row",
            flexWrap: compact ? "nowrap" : "wrap",
            alignItems: compact ? "flex-start" : "center",
            gap: 8,
            paddingBottom: 8,
          }}
        >
          {pulse.waits.map((wait) => {
            const elapsed = wait.since ? compactDuration(wait.since, readAt) : null;
            return (
              <button
                key={`${wait.kind}:${wait.id}:${wait.reason}`}
                type="button"
                data-testid={`pulse-wait-${wait.id}`}
                onClick={() => onOpen?.(wait.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  margin: 0,
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: onOpen ? "pointer" : "default",
                  color: "inherit",
                }}
              >
                <Spin size="small" />
                <Tag style={{ marginInlineEnd: 0 }}>{wait.id}</Tag>
                <Tag style={{ marginInlineEnd: 0 }}>{wait.reason}</Tag>
                {wait.next !== "none" ? (
                  <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                    {wait.next}
                  </Tag>
                ) : null}
                {elapsed ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {elapsed}
                  </Text>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
