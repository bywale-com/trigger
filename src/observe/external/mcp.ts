/**
 * Remote MCP over Streamable HTTP.
 * Stateless JSON responses: each POST is its own server, which is what a
 * Vercel function can finish. GET does not open an SSE stream.
 * Read tools only. Do not register a tool that dispatches or writes.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { currentSnapshot, type SnapshotBody } from "../refresh.ts";
import type { Snapshot } from "../snapshot.ts";
import {
  applyCors,
  clientKey,
  logExternal,
  mediaType,
  readRaw,
  requestOrigin,
  requireRead,
  safeError,
  sendError,
  sendJson,
  sharedLimit,
  type Limit,
} from "./http.ts";
import {
  envelope,
  getExecution,
  getInitiative,
  getPacket,
  getPlates,
  listInitiatives,
  listPackets,
  listPlates,
  projectFactory,
  projectNext,
} from "./project.ts";

const INSTRUCTIONS =
  "Trigger is a read-only desk for the Tower factory. Tools return the same snapshot the desk shows. They do not dispatch workers, change the ledger, or predict the next run. nextAt is null when this read has no execution instant. If readFailed is true, the body is the last successful snapshot.";

export type McpDeps = {
  current?: () => Promise<SnapshotBody>;
  limit?: Limit;
};

type ToolResult = { content: [{ type: "text"; text: string }]; isError?: boolean };

function toolText(body: unknown, isError = false): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(body) }], ...(isError ? { isError: true } : {}) };
}

async function readModel(current: () => Promise<SnapshotBody>): Promise<
  | { ok: true; snapshot: Snapshot; stale: boolean }
  | { ok: false; result: ToolResult }
> {
  try {
    const body = await current();
    if (!body.snapshot) {
      return {
        ok: false,
        result: toolText(
          { error: { code: "read_unavailable", message: "Tower has no snapshot. The last read failed and none is stored." } },
          true,
        ),
      };
    }
    return { ok: true, snapshot: body.snapshot, stale: body.readFailed };
  } catch (error) {
    return { ok: false, result: toolText({ error: { code: "internal", message: safeError(error) } }, true) };
  }
}

function createServer(current: () => Promise<SnapshotBody>): McpServer {
  const server = new McpServer(
    { name: "trigger", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );
  const finish = async (data: (snapshot: Snapshot) => unknown | null, missing: string) => {
    const loaded = await readModel(current);
    if (!loaded.ok) return loaded.result;
    const value = data(loaded.snapshot);
    if (value == null) return toolText({ error: { code: "not_found", message: missing } }, true);
    return toolText(envelope(loaded.snapshot, loaded.stale, value));
  };

  server.registerTool(
    "get_factory_status",
    {
      title: "Factory status",
      description:
        "Read Tower factory status from the current Trigger snapshot: scope, activation, pulse, blockers, and whether a next run time is known. Use this first.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => finish((snapshot) => projectFactory(snapshot), "Factory snapshot missing."),
  );
  server.registerTool(
    "list_initiatives",
    {
      title: "List initiatives",
      description: "List Tower initiatives on the current snapshot, with stage, dependencies, and activity. Does not include specification text.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => finish((snapshot) => listInitiatives(snapshot), "No initiatives."),
  );
  server.registerTool(
    "get_initiative",
    {
      title: "Get initiative",
      description: "Open one initiative by its stable id, including obligation, specification, journals, lifecycle, and GitHub evidence.",
      inputSchema: z.object({ id: z.string().describe("Initiative id from list_initiatives.") }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => finish((snapshot) => getInitiative(snapshot, id), `No initiative ${id}.`),
  );
  server.registerTool(
    "list_packets",
    {
      title: "List packets",
      description: "List Tower packets. Pass initiativeId to keep one initiative's packets.",
      inputSchema: z.object({
        initiativeId: z.string().optional().describe("Optional initiative id."),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ initiativeId }) =>
      finish((snapshot) => {
        const listed = listPackets(snapshot, initiativeId);
        if (listed.missingInitiative) return null;
        return listed.packets;
      }, `No initiative ${initiativeId ?? ""}.`),
  );
  server.registerTool(
    "get_packet",
    {
      title: "Get packet",
      description:
        "Open one packet by its stable id: stage, blocker, dispatch, lease, checks, lifecycle, GitHub evidence, and plate paths.",
      inputSchema: z.object({ id: z.string().describe("Packet id from list_packets.") }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => finish((snapshot) => getPacket(snapshot, id), `No packet ${id}.`),
  );
  server.registerTool(
    "get_execution",
    {
      title: "Get execution",
      description:
        "Read execution and implementation evidence for a packet or initiative id: lifecycle, lease, checks, and GitHub. A missing worker is null, not guessed.",
      inputSchema: z.object({ id: z.string().describe("Packet or initiative id.") }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ id }) => finish((snapshot) => getExecution(snapshot, id), `No execution record ${id}.`),
  );
  server.registerTool(
    "get_next_actions",
    {
      title: "Next actions",
      description:
        "Read the controller's eligible wakes and waiting reasons. nextAt is null. Timing is unknown unless a cron is recorded, and even then Trigger does not compute the next instant.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => finish((snapshot) => projectNext(snapshot), "No pulse."),
  );
  server.registerTool(
    "get_plates",
    {
      title: "Plates",
      description:
        "Read UI plates recorded on a packet, plus the associated initiative specification. Omit packetId to list plate records and specification paths.",
      inputSchema: z.object({
        packetId: z.string().optional().describe("Packet id. Omit to list plates and specification paths."),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ packetId }) =>
      finish((snapshot) => (packetId ? getPlates(snapshot, packetId) : listPlates(snapshot)), `No plates for ${packetId ?? ""}.`),
  );
  return server;
}

export async function handleMcp(req: IncomingMessage, res: ServerResponse, deps: McpDeps = {}): Promise<void> {
  const origin = requestOrigin(req);
  const method = req.method ?? "GET";
  const path = new URL(req.url ?? "/", origin).pathname;
  if (method === "OPTIONS") {
    applyCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!(deps.limit ?? sharedLimit).allow(clientKey(req))) {
    sendError(res, "rate_limited", "Too many requests.", origin);
    logExternal(method, path, 429);
    return;
  }
  if (!requireRead(req, res, origin)) {
    logExternal(method, path, res.statusCode);
    return;
  }
  if (method === "GET") {
    sendJson(res, 405, {
      error: {
        code: "method_not_allowed",
        message: "This MCP server answers Streamable HTTP POST with a JSON body. It does not hold an SSE stream open.",
      },
    }, { allow: "POST, DELETE" });
    logExternal(method, path, 405);
    return;
  }
  if (method !== "POST" && method !== "DELETE") {
    sendError(res, "method_not_allowed", "POST or DELETE only.", origin);
    return;
  }
  let parsed: unknown;
  if (method === "POST") {
    if (mediaType(req) && mediaType(req) !== "application/json") {
      sendError(res, "unsupported_media", "MCP POST expects application/json.", origin);
      return;
    }
    const raw = await readRaw(req);
    if (!raw.ok) {
      sendError(res, "payload_too_large", "Request body is too large.", origin);
      return;
    }
    if (!raw.raw.trim()) {
      sendError(res, "bad_request", "MCP POST body is empty.", origin);
      return;
    }
    try {
      parsed = JSON.parse(raw.raw) as unknown;
    } catch {
      sendError(res, "bad_request", "MCP POST body is not JSON.", origin);
      return;
    }
  }
  const current = deps.current ?? currentSnapshot;
  const server = createServer(current);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, parsed);
  } catch (error) {
    console.error(`external mcp failed: ${safeError(error)}`);
    sendError(res, "internal", "MCP request failed.", origin);
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
    logExternal(method, path, res.statusCode);
  }
}
