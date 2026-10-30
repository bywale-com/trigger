import { ConfigProvider, Typography } from "antd";
import { useEffect, useState } from "react";
import { mergeRead, REFRESH_MS, visiblePages, type DeskFilter, type Page, type SnapshotBody } from "../observe/snapshot.ts";
import { Chrome } from "./chrome.tsx";
import { Detail } from "./Detail.tsx";
import { GraphView } from "./GraphView.tsx";
import { TableView } from "./TableView.tsx";
import { themeConfig } from "./theme.ts";

const { Text } = Typography;

export function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [view, setView] = useState<"Table" | "Graph">("Table");
  const [pageId, setPageId] = useState<string | null>(null);
  const [filters, setFilters] = useState<DeskFilter[]>([]);
  const [body, setBody] = useState<SnapshotBody | null>(null);

  useEffect(() => {
    let stopped = false;
    let previous: SnapshotBody | null = null;
    const tick = async () => {
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
    };
    void tick();
    const timer = setInterval(() => void tick(), REFRESH_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  const snapshot = body?.snapshot ?? null;
  const pages = snapshot?.pages ?? [];
  const shown = visiblePages(pages, filters);
  const open = pages.find((page) => page.id === pageId) ?? null;

  const openPage = (id: string) => setPageId(id);
  const changeView = (next: "Table" | "Graph") => {
    setPageId(null);
    setView(next);
  };

  return (
    <ConfigProvider theme={themeConfig(mode)}>
      <Chrome
        mode={mode}
        onMode={setMode}
        view={view}
        onView={changeView}
        refName={snapshot?.ref ?? null}
        sha={snapshot?.sha ?? null}
        factoryPull={snapshot?.factoryPull ?? null}
        revision={snapshot?.stateRevision ?? null}
        scopeStatus={snapshot?.scope.status ?? null}
        readFailed={body?.readFailed ?? false}
      >
        {open && snapshot ? (
          <Detail
            page={open}
            readAt={snapshot.readAt}
            repo={snapshot.repo}
            onBack={() => setPageId(null)}
            onOpen={openPage}
          />
        ) : view === "Graph" ? (
          <GraphView allPages={pages} pages={shown} filters={filters} onFilter={setFilters} onOpen={openPage} />
        ) : (
          <TableView pages={shown} filters={filters} onFilter={setFilters} onOpen={openPage} />
        )}
        {!snapshot && body?.readFailed ? <Text type="secondary">No pages.</Text> : null}
      </Chrome>
    </ConfigProvider>
  );
}

export type { Page };
