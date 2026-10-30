import { CloseOutlined, CompressOutlined, ExpandOutlined } from "@ant-design/icons";
import { Button, theme } from "antd";
import { useRef, useState, type ReactNode } from "react";
import { useCompact } from "./compact.ts";

export function PagePane({
  expanded,
  onExpand,
  onClose,
  children,
}: {
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const compact = useCompact();
  const { token } = theme.useToken();
  const drag = useRef<{ y: number; height: number } | null>(null);
  const full = useRef(expanded);
  const [lift, setLift] = useState<number | null>(null);
  full.current = expanded;

  const bar = (
    <div className="desk-pane-bar">
      <Button
        type="text"
        size="small"
        aria-label={expanded ? "Collapse page" : "Expand page"}
        data-testid="pane-expand"
        icon={expanded ? <CompressOutlined /> : <ExpandOutlined />}
        onClick={onExpand}
      />
      <Button type="text" size="small" aria-label="Close page" data-testid="pane-close" icon={<CloseOutlined />} onClick={onClose} />
    </div>
  );

  if (compact) {
    return (
      <aside
        data-testid="page-sheet"
        className={expanded ? "desk-sheet desk-sheet-expanded" : "desk-sheet"}
        style={{
          background: token.colorBgContainer,
          color: token.colorText,
          boxShadow: token.boxShadowSecondary,
          ...(lift != null && !expanded ? { flex: "0 0 auto", height: lift } : null),
        }}
      >
        <div className="desk-sheet-top">
          <div
            className="desk-sheet-grab"
            data-testid="sheet-grab"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize page"
            onPointerDown={(event) => {
              const sheet = event.currentTarget.closest("[data-testid=page-sheet]");
              if (!(sheet instanceof HTMLElement)) return;
              drag.current = { y: event.clientY, height: sheet.getBoundingClientRect().height };
              try {
                event.currentTarget.setPointerCapture(event.pointerId);
              } catch {
                /* a synthetic pointer has nothing to capture */
              }
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              const sheet = event.currentTarget.closest("[data-testid=page-sheet]");
              const split = sheet?.parentElement?.getBoundingClientRect();
              const next = drag.current.height + (drag.current.y - event.clientY);
              const pulled = event.clientY - drag.current.y;
              const ceiling = split ? split.height - 96 : window.innerHeight - 96;
              if (pulled > 96 && next < Math.min(drag.current.height - 48, window.innerHeight * 0.42)) {
                drag.current = null;
                setLift(null);
                if (full.current) {
                  full.current = false;
                  onExpand();
                }
                onClose();
                return;
              }
              if (event.clientY <= 28 || next >= window.innerHeight - 12) {
                setLift(null);
                if (!full.current) {
                  full.current = true;
                  onExpand();
                }
                return;
              }
              const height = Math.max(260, Math.min(Math.round(ceiling), Math.round(next)));
              setLift(height);
              if (full.current) {
                full.current = false;
                onExpand();
              }
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            <span style={{ background: token.colorTextQuaternary }} />
          </div>
          <Button
            type="text"
            size="small"
            aria-label="Close page"
            data-testid="pane-close"
            className="desk-sheet-close"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ position: "absolute", right: 0, top: 0, zIndex: 1 }}
          />
        </div>
        <div className="desk-pane-body">{children}</div>
      </aside>
    );
  }

  return (
    <aside
      data-testid="page-pane"
      className="desk-pane"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorSplit}`,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      {bar}
      <div className="desk-pane-body">{children}</div>
    </aside>
  );
}
