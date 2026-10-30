import { Spin, Tag, Typography, theme } from "antd";
import { compactDuration, type FactoryPulse } from "../observe/tower/pulse.ts";
import { useCompact } from "./compact.ts";

const { Text } = Typography;

export function FactoryPulseBar({
  pulse,
  readAt,
  onOpen,
}: {
  pulse: FactoryPulse;
  readAt: string;
  onOpen?: (id: string) => void;
}) {
  const { token } = theme.useToken();
  const compact = useCompact();
  const live = pulse.live[0];
  const remaining = pulse.remaining;
  const leaseLeft = live?.until ? compactDuration(readAt, live.until) : null;
  const next = pulse.wakes[0];
  return (
    <div
      data-testid="factory-pulse"
      className="factory-pulse"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: compact ? 8 : 10,
        marginBottom: 12,
        padding: compact ? "8px 0" : "8px 0 4px",
        borderBottom: `1px solid ${token.colorSplit}`,
      }}
    >
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
          <Tag data-testid="pulse-unconfirmed" style={{ marginInlineEnd: 0 }}>
            unconfirmed
          </Tag>
        </span>
      )}
      <Tag data-testid="pulse-reason" style={{ marginInlineEnd: 0 }}>
        {pulse.reason}
      </Tag>
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
  );
}
