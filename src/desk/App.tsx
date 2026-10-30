import { ConfigProvider, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { mergeRead, REFRESH_MS, visiblePages, type DeskFilter, type Page, type SnapshotBody } from "../observe/snapshot.ts";
import { Chrome } from "./chrome.tsx";
import { useCompact } from "./compact.ts";
import { FactoryPulseBar } from "./Pulse.tsx";
import { Detail } from "./Detail.tsx";
import { GraphView } from "./GraphView.tsx";
import { PagePane } from "./Pane.tsx";
import { hashForPage, pageFromHash, readMode, writeMode, neighbors } from "./place.ts";
import { TableView } from "./TableView.tsx";
import { themeConfig } from "./theme.ts";

const { Text } = Typography;

export function App() {
  const compact = useCompact();
  const [mode, setMode] = useState<"light" | "dark">(readMode);
  const [view, setView] = useState<"Table" | "Graph">("Table");
  const [pageId, setPageId] = useState<string | null>(() => pageFromHash(window.location.hash));
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<DeskFilter[]>([]);
  const [body, setBody] = useState<SnapshotBody | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const onHash = () => setPageId(pageFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const next = hashForPage(pageId);
    if (window.location.hash !== next) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    }
  }, [pageId]);

  useEffect(() => {
    writeMode(mode);
  }, [mode]);

  useEffect(() => {
    let stopped = false;
    let previous: SnapshotBody | null = null;
    const tick = async () => {
      if (previous) setRefreshing(true);
      let next: SnapshotBody;
      try {
        const response = await fetch("/api/snapshot");
        if (!response.ok) throw new Error(String(response.status));
        next = mergeRead(previous, (await response.json()) as SnapshotBody, false);
      } catch {
        next = mergeRead(previous, null, true);
      }
      if (stopped) return;
      previous = next;
      setBody(next);
      setRefreshing(false);
    };
    void tick();
    const timer = setInterval(() => void tick(), REFRESH_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      if (event.key === "Escape") {
        if (document.querySelector(".ant-image-preview-img, .ant-image-preview-operations")) return;
        if (expanded) {
          setExpanded(false);
          return;
        }
        if (pageId) setPageId(null);
        return;
      }
      if ((event.key !== "j" && event.key !== "k") || !pageId || !body?.snapshot) return;
      const current = body.snapshot.pages.find((page) => page.id === pageId);
      if (!current) return;
      const walk = neighbors(body.snapshot.pages, current);
      const next = event.key === "j" ? walk.next : walk.prev;
      if (next) setPageId(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [body, expanded, pageId]);

  const snapshot = body?.snapshot ?? null;
  const pages = snapshot?.pages ?? [];
  const shown = visiblePages(pages, filters);
  const open = pages.find((page) => page.id === pageId) ?? null;

  const openPage = (id: string) => {
    setPageId(id);
    setExpanded(false);
  };
  const closePage = () => {
    setPageId(null);
    setExpanded(false);
  };

  const main =
    view === "Graph" ? (
      <GraphView
        allPages={pages}
        pages={shown}
        filters={filters}
        selectedId={open?.id ?? null}
        onFilter={setFilters}
        onOpen={openPage}
      />
    ) : (
      <TableView pages={shown} filters={filters} selectedId={open?.id ?? null} onFilter={setFilters} onOpen={openPage} />
    );

  return (
    <ConfigProvider theme={themeConfig(mode)}>
      <Chrome
        mode={mode}
        onMode={setMode}
        view={view}
        onView={setView}
        refName={snapshot?.ref ?? null}
        sha={snapshot?.sha ?? null}
        factoryPull={snapshot?.factoryPull ?? null}
        revision={snapshot?.stateRevision ?? null}
        scopeStatus={snapshot?.scope.status ?? null}
        readFailed={body?.readFailed ?? false}
        refreshing={refreshing}
        fill={Boolean(open) && compact}
      >
        {!body ? (
          <div data-testid="desk-loading" className="desk-loading">
            <Spin />
          </div>
        ) : (
          <div className={open && compact ? "desk-body desk-body-open" : "desk-body"}>
            {snapshot ? <FactoryPulseBar pulse={snapshot.pulse} readAt={snapshot.readAt} onOpen={openPage} /> : null}
            <div className={open ? (expanded ? "desk-split desk-split-expanded" : "desk-split") : undefined}>
            <div className="desk-main">{main}</div>
            {open && snapshot ? (
              <PagePane expanded={expanded} onExpand={() => setExpanded((current) => !current)} onClose={closePage}>
                <Detail
                  page={open}
                  pages={pages}
                  readAt={snapshot.readAt}
                  repo={snapshot.repo}
                  onBack={closePage}
                  onOpen={openPage}
                  onFilter={setFilters}
                  filters={filters}
                />
              </PagePane>
            ) : null}
          </div>
          </div>
        )}
        {!snapshot && body?.readFailed ? <Text type="secondary">No pages.</Text> : null}
      </Chrome>
    </ConfigProvider>
  );
}

export type { Page };
