import { CloseOutlined, CompressOutlined, ExpandOutlined } from "@ant-design/icons";
import { Button, theme } from "antd";
import { useRef, type ReactNode } from "react";
import { useCompact } from "./compact.ts";
import { SHEET_INSET } from "./place.ts";

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
  const drag = useRef<{ y: number } | null>(null);

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
      <>
        <button type="button" className="desk-sheet-backdrop" data-testid="sheet-backdrop" aria-label="Close page" onClick={onClose} />
        <aside
          data-testid="page-sheet"
          className={expanded ? "desk-sheet desk-sheet-expanded" : "desk-sheet"}
          style={{
            background: token.colorBgContainer,
            color: token.colorText,
            boxShadow: token.boxShadowSecondary,
            border: `1px solid ${token.colorSplit}`,
            left: SHEET_INSET,
            right: SHEET_INSET,
            bottom: SHEET_INSET,
          }}
        >
          <div
            className="desk-sheet-grab"
            data-testid="sheet-grab"
            onPointerDown={(event) => {
              drag.current = { y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              if (event.clientY - drag.current.y > 72) {
                drag.current = null;
                onClose();
              }
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            <span style={{ background: token.colorTextQuaternary }} />
          </div>
          {bar}
          <div className="desk-pane-body">{children}</div>
        </aside>
      </>
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
