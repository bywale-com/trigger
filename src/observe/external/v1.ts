/**
 * Versioned read API. Write routes are not registered.
 * A later write surface needs its own scope, handler, and approval record.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { currentSnapshot, type SnapshotBody } from "../refresh.ts";
import { applyCors, clientKey, logExternal, requestOrigin, requireRead, sendError, sendJson, sharedLimit, type Limit } from "./http.ts";
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

const ID = /^[A-Za-z0-9._:-]{1,128}$/;

export type V1Deps = {
  current?: () => Promise<SnapshotBody>;
  limit?: Limit;
};

async function load(current: () => Promise<SnapshotBody>) {
  const body = await current();
  if (!body.snapshot) {
    return { ok: false as const };
  }
  return { ok: true as const, snapshot: body.snapshot, stale: body.readFailed };
}

function sendData(res: ServerResponse, snapshot: Parameters<typeof envelope>[0], stale: boolean, data: unknown): void {
  sendJson(res, 200, envelope(snapshot, stale, data));
}

export async function handleV1(req: IncomingMessage, res: ServerResponse, deps: V1Deps = {}): Promise<void> {
  const origin = requestOrigin(req);
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", origin);
  const path = url.pathname;
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
  if (method !== "GET") {
    sendError(res, "method_not_allowed", "The read API accepts GET.", origin);
    logExternal(method, path, 405);
    return;
  }
  if (!requireRead(req, res, origin)) {
    logExternal(method, path, res.statusCode);
    return;
  }
  const parts = path.replace(/^\/api\/v1\/?/, "").split("/").filter(Boolean);
  const current = deps.current ?? currentSnapshot;
  let loaded: Awaited<ReturnType<typeof load>>;
  try {
    loaded = await load(current);
  } catch (error) {
    console.error(`external read failed: ${error instanceof Error ? error.message : "error"}`);
    sendError(res, "internal", "The read failed.", origin);
    return;
  }
  if (!loaded.ok) {
    sendError(res, "read_unavailable", "Tower has no snapshot. The last read failed and none is stored.", origin);
    logExternal(method, path, 503);
    return;
  }
  const { snapshot, stale } = loaded;
  const [head, id, extra] = parts;
  if (extra) {
    sendError(res, "not_found", "Unknown read route.", origin);
    return;
  }
  if (head === "factory" && !id) {
    sendData(res, snapshot, stale, projectFactory(snapshot));
    return;
  }
  if (head === "initiatives" && !id) {
    sendData(res, snapshot, stale, listInitiatives(snapshot));
    return;
  }
  if (head === "initiatives" && id && ID.test(id)) {
    const initiative = getInitiative(snapshot, id);
    if (!initiative) {
      sendError(res, "not_found", `No initiative ${id}.`, origin);
      return;
    }
    sendData(res, snapshot, stale, initiative);
    return;
  }
  if (head === "packets" && !id) {
    const initiativeId = url.searchParams.get("initiativeId");
    if (initiativeId && !ID.test(initiativeId)) {
      sendError(res, "bad_request", "initiativeId is not a stable id.", origin);
      return;
    }
    const listed = listPackets(snapshot, initiativeId ?? undefined);
    if (listed.missingInitiative) {
      sendError(res, "not_found", `No initiative ${initiativeId}.`, origin);
      return;
    }
    sendData(res, snapshot, stale, listed.packets);
    return;
  }
  if (head === "packets" && id && ID.test(id)) {
    const packet = getPacket(snapshot, id);
    if (!packet) {
      sendError(res, "not_found", `No packet ${id}.`, origin);
      return;
    }
    sendData(res, snapshot, stale, packet);
    return;
  }
  if (head === "executions" && id && ID.test(id)) {
    const execution = getExecution(snapshot, id);
    if (!execution) {
      sendError(res, "not_found", `No execution record ${id}.`, origin);
      return;
    }
    sendData(res, snapshot, stale, execution);
    return;
  }
  if (head === "next" && !id) {
    sendData(res, snapshot, stale, projectNext(snapshot));
    return;
  }
  if (head === "plates" && !id) {
    sendData(res, snapshot, stale, listPlates(snapshot));
    return;
  }
  if (head === "plates" && id && ID.test(id)) {
    const plates = getPlates(snapshot, id);
    if (!plates) {
      sendError(res, "not_found", `No plates for ${id}.`, origin);
      return;
    }
    sendData(res, snapshot, stale, plates);
    return;
  }
  sendError(res, "not_found", "Unknown read route.", origin);
  logExternal(method, path, res.statusCode);
}
