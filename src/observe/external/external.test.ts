import { createServer, type Server } from "node:http";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFixture } from "../tower/read.ts";
import type { SnapshotBody } from "../refresh.ts";
import { checkBearer, freshExpiry, signToken } from "./auth.ts";
import { memoryLimit, mcpResource } from "./http.ts";
import { resetOauthMemory, s256, testVerifier } from "./oauth.ts";
import { handleExternal, isExternalPath } from "./route.ts";

const fixture = join(import.meta.dirname, "../tower/testdata/9c45f19");
const token = "test-read-token";

async function listen(deps: Parameters<typeof handleExternal>[2] = {}) {
  const server = createServer((req, res) => {
    void handleExternal(req, res, deps);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { server, origin: `http://127.0.0.1:${port}` };
}

async function close(server: Server) {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

function toolBody(result: unknown) {
  const record = result as { content?: { text?: string }[]; isError?: boolean };
  const text = record.content?.[0]?.text ?? "{}";
  return { isError: Boolean(record.isError), body: JSON.parse(text) as Record<string, unknown> };
}

describe("external read API and MCP", () => {
  let server: Server;
  let origin: string;
  let current: () => Promise<SnapshotBody>;

  beforeAll(async () => {
    process.env.TRIGGER_READ_TOKEN = token;
    delete process.env.TRIGGER_OAUTH_SECRET;
    resetOauthMemory();
    const snapshot = await readFixture(fixture, "main");
    current = async () => ({ readFailed: false, snapshot });
    const started = await listen({ current });
    server = started.server;
    origin = started.origin;
  });

  afterAll(async () => {
    await close(server);
  });

  it("keeps the desk snapshot off this surface", () => {
    expect(isExternalPath("/api/snapshot")).toBe(false);
    expect(isExternalPath("/api/tree-file")).toBe(false);
    expect(isExternalPath("/api/mcp")).toBe(true);
  });

  it("rejects a missing or wrong token and publishes OAuth metadata", async () => {
    const missing = await fetch(`${origin}/api/v1/factory`);
    expect(missing.status).toBe(401);
    expect(missing.headers.get("www-authenticate")).toContain("resource_metadata=");
    const wrong = await fetch(`${origin}/api/v1/factory`, { headers: { authorization: "Bearer nope" } });
    expect(wrong.status).toBe(401);
    const metadata = await fetch(`${origin}/.well-known/oauth-protected-resource`);
    expect(metadata.status).toBe(200);
    const document = (await metadata.json()) as { resource: string; authorization_servers: string[] };
    expect(document.resource).toBe(`${origin}/api/mcp`);
    expect(document.authorization_servers).toEqual([origin]);
    const pathSpecific = await fetch(`${origin}/.well-known/oauth-protected-resource/api/mcp`);
    expect(pathSpecific.status).toBe(200);
    const serverMetadata = await fetch(`${origin}/.well-known/oauth-authorization-server`);
    const oauth = (await serverMetadata.json()) as { code_challenge_methods_supported: string[]; authorization_response_iss_parameter_supported: boolean };
    expect(oauth.code_challenge_methods_supported).toContain("S256");
    expect(oauth.authorization_response_iss_parameter_supported).toBe(true);
  });

  it("returns the fixture snapshot and refuses writes", async () => {
    const response = await fetch(`${origin}/api/v1/factory`, { headers: { authorization: `Bearer ${token}` } });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { sha: string; stale: boolean; data: { timing: { nextAt: null; known: boolean }; pulse: { reason: string } } };
    const snapshot = await readFixture(fixture, "main");
    expect(body.sha).toBe(snapshot.sha);
    expect(body.stale).toBe(false);
    expect(body.data.pulse.reason).toBe("inactive");
    expect(body.data.timing.nextAt).toBeNull();
    expect(body.data.timing.known).toBe(false);
    const posted = await fetch(`${origin}/api/v1/factory`, { method: "POST", headers: { authorization: `Bearer ${token}` } });
    expect(posted.status).toBe(405);
    const missing = await fetch(`${origin}/api/v1/packets/does-not-exist`, { headers: { authorization: `Bearer ${token}` } });
    expect(missing.status).toBe(404);
    const execution = await fetch(`${origin}/api/v1/executions/pkt-001-click-attribution`, { headers: { authorization: `Bearer ${token}` } });
    const executionBody = (await execution.json()) as { data: { github: { available: boolean; unavailableReason: string }; worker: null } };
    expect(execution.status).toBe(200);
    expect(executionBody.data.github.available).toBe(false);
    expect(executionBody.data.github.unavailableReason).toBeTruthy();
    expect(executionBody.data.worker).toBeNull();
  });

  it("reports a stale snapshot and a missing snapshot", async () => {
    const snapshot = await readFixture(fixture, "main");
    const staleServer = await listen({ current: async () => ({ readFailed: true, snapshot }) });
    const stale = await fetch(`${staleServer.origin}/api/v1/next`, { headers: { authorization: `Bearer ${token}` } });
    const staleBody = (await stale.json()) as { stale: boolean; readFailed: boolean; data: { timing: { nextAt: null } } };
    expect(stale.status).toBe(200);
    expect(staleBody.stale).toBe(true);
    expect(staleBody.readFailed).toBe(true);
    expect(staleBody.data.timing.nextAt).toBeNull();
    await close(staleServer.server);

    const emptyServer = await listen({ current: async () => ({ readFailed: true, snapshot: null }) });
    const empty = await fetch(`${emptyServer.origin}/api/v1/factory`, { headers: { authorization: `Bearer ${token}` } });
    expect(empty.status).toBe(503);
    await close(emptyServer.server);
  });

  it("limits requests and truncates a long specification", async () => {
    const limited = await listen({ current, limit: memoryLimit(2) });
    const headers = { authorization: `Bearer ${token}` };
    expect((await fetch(`${limited.origin}/api/v1/factory`, { headers })).status).toBe(200);
    expect((await fetch(`${limited.origin}/api/v1/factory`, { headers })).status).toBe(200);
    expect((await fetch(`${limited.origin}/api/v1/factory`, { headers })).status).toBe(429);
    await close(limited.server);

    const snapshot = await readFixture(fixture, "main");
    const huge = structuredClone(snapshot);
    const initiative = huge.pages.find((page) => page.id === "exec-identity");
    if (!initiative || initiative.type !== "Initiative") throw new Error("initiative");
    initiative.specificationText = "x".repeat(10_000);
    const big = await listen({ current: async () => ({ readFailed: false, snapshot: huge }) });
    const response = await fetch(`${big.origin}/api/v1/initiatives/exec-identity`, { headers });
    const body = (await response.json()) as { data: { specificationText: string; specificationTruncated: boolean } };
    expect(body.data.specificationTruncated).toBe(true);
    expect(body.data.specificationText.length).toBe(6_000);
    await close(big.server);
  });

  it("issues an OAuth read token only after the operator token matches", async () => {
    const verifier = testVerifier();
    const registered = await fetch(`${origin}/api/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        redirect_uris: ["http://127.0.0.1/callback"],
        token_endpoint_auth_method: "none",
      }),
    });
    expect(registered.status).toBe(201);
    const client = (await registered.json()) as { client_id: string };
    const params = new URLSearchParams({
      response_type: "code",
      client_id: client.client_id,
      redirect_uri: "http://127.0.0.1/callback",
      code_challenge: s256(verifier),
      code_challenge_method: "S256",
      state: "xyz",
      scope: "trigger:read offline_access",
      resource: `${origin}/api/mcp`,
    });
    const form = await fetch(`${origin}/api/oauth/authorize?${params}`);
    expect(form.status).toBe(200);
    const denied = await fetch(`${origin}/api/oauth/authorize`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...Object.fromEntries(params), read_token: "wrong" }),
      redirect: "manual",
    });
    expect(denied.status).toBe(401);

    const approved = await fetch(`${origin}/api/oauth/authorize`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...Object.fromEntries(params), read_token: token }),
      redirect: "manual",
    });
    expect(approved.status).toBe(302);
    const location = new URL(approved.headers.get("location") ?? "http://127.0.0.1/callback");
    expect(location.searchParams.get("iss")).toBe(origin);
    const code = location.searchParams.get("code") ?? "";
    const exchanged = await fetch(`${origin}/api/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        client_id: client.client_id,
        redirect_uri: "http://127.0.0.1/callback",
        resource: `${origin}/api/mcp`,
      }),
    });
    expect(exchanged.status).toBe(200);
    const issued = (await exchanged.json()) as { access_token: string; refresh_token: string; scope: string };
    expect(issued.scope).toContain("trigger:read");
    const authed = await fetch(`${origin}/api/v1/initiatives`, { headers: { authorization: `Bearer ${issued.access_token}` } });
    expect(authed.status).toBe(200);
    const replay = await fetch(`${origin}/api/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        client_id: client.client_id,
        redirect_uri: "http://127.0.0.1/callback",
        resource: `${origin}/api/mcp`,
      }),
    });
    expect(replay.status).toBe(400);
    const refreshed = await fetch(`${origin}/api/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: issued.refresh_token,
        client_id: client.client_id,
        resource: `${origin}/api/mcp`,
      }),
    });
    expect(refreshed.status).toBe(200);
    const again = await fetch(`${origin}/api/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: issued.refresh_token,
        client_id: client.client_id,
        resource: `${origin}/api/mcp`,
      }),
    });
    expect(again.status).toBe(400);

    const write = signToken(
      { v: 1, kind: "access", scope: "trigger:write", aud: mcpResource(origin), ...freshExpiry(60) },
      token,
    );
    expect(checkBearer(write, mcpResource(origin)).ok).toBe(false);
  });

  it("accepts ChatGPT client metadata and a loopback redirect on any port", async () => {
    const cimd = await listen({
      current,
      fetchCimd: async () =>
        new Response(JSON.stringify({ redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"] }), { status: 200 }),
    });
    const params = new URLSearchParams({
      response_type: "code",
      client_id: "https://chatgpt.com/oauth/client.json",
      redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
      code_challenge: s256(testVerifier()),
      code_challenge_method: "S256",
      resource: `${cimd.origin}/api/mcp`,
    });
    const form = await fetch(`${cimd.origin}/api/oauth/authorize?${params}`);
    expect(form.status).toBe(200);
    expect(await form.text()).toContain("chatgpt.com");
    await close(cimd.server);

    const evil = await listen({
      current,
      fetchCimd: async () => {
        throw new Error("should not fetch");
      },
    });
    const blocked = await fetch(
      `${evil.origin}/api/oauth/authorize?${new URLSearchParams({
        response_type: "code",
        client_id: "https://evil.example/client.json",
        redirect_uri: "https://evil.example/callback",
        code_challenge: s256(testVerifier()),
        code_challenge_method: "S256",
      })}`,
    );
    expect(blocked.status).toBe(400);
    await close(evil.server);

    const registered = await fetch(`${origin}/api/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ redirect_uris: ["http://127.0.0.1/callback"] }),
    });
    const client = (await registered.json()) as { client_id: string };
    const loopback = await fetch(
      `${origin}/api/oauth/authorize?${new URLSearchParams({
        response_type: "code",
        client_id: client.client_id,
        redirect_uri: "http://127.0.0.1:61264/callback",
        code_challenge: s256(testVerifier()),
        code_challenge_method: "S256",
        resource: `${origin}/api/mcp`,
      })}`,
    );
    expect(loopback.status).toBe(200);
  });

  it("lets an independent MCP client read the fixture", async () => {
    const transport = new StreamableHTTPClientTransport(new URL(`${origin}/api/mcp`), {
      requestInit: { headers: { authorization: `Bearer ${token}` } },
    });
    const client = new Client({ name: "trigger-walk", version: "0.0.0" });
    await client.connect(transport);
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
      "get_execution",
      "get_factory_status",
      "get_initiative",
      "get_next_actions",
      "get_packet",
      "get_plates",
      "list_initiatives",
      "list_packets",
    ]);
    const status = toolBody(await client.callTool({ name: "get_factory_status", arguments: {} }));
    const snapshot = await readFixture(fixture, "main");
    const statusData = status.body.data as { sha?: string; pulse?: { reason: string } };
    expect(status.body.sha).toBe(snapshot.sha);
    expect(statusData.pulse?.reason).toBe(snapshot.pulse.reason);
    const initiatives = toolBody(await client.callTool({ name: "list_initiatives", arguments: {} }));
    const rows = initiatives.body.data as { id: string }[];
    expect(rows.map((row) => row.id)).toEqual(snapshot.pages.filter((page) => page.type === "Initiative").map((page) => page.id));
    const packet = toolBody(await client.callTool({ name: "get_packet", arguments: { id: "pkt-001-click-attribution" } }));
    const packetData = packet.body.data as { id: string; lifecycle: { id: string; presence: string }[]; github: { available: boolean } };
    expect(packetData.id).toBe("pkt-001-click-attribution");
    expect(packetData.lifecycle.find((step) => step.id === "verified")?.presence).toBe("yes");
    expect(packetData.github.available).toBe(false);
    const execution = toolBody(await client.callTool({ name: "get_execution", arguments: { id: "pkt-001-click-attribution" } }));
    const executionData = execution.body.data as { checks: unknown[]; worker: null; github: { unavailableReason: string } };
    expect(executionData.checks.length).toBeGreaterThan(0);
    expect(executionData.worker).toBeNull();
    expect(executionData.github.unavailableReason).toBeTruthy();
    const next = toolBody(await client.callTool({ name: "get_next_actions", arguments: {} }));
    const nextData = next.body.data as { timing: { nextAt: null; known: boolean }; basis: string };
    expect(nextData.timing.nextAt).toBeNull();
    expect(nextData.timing.known).toBe(false);
    expect(nextData.basis).toContain(snapshot.pulse.reason);
    const missing = toolBody(await client.callTool({ name: "get_packet", arguments: { id: "missing-packet" } }));
    expect(missing.isError).toBe(true);
    expect(JSON.stringify(missing.body)).toContain("not_found");
    await client.close();

    const denied = await fetch(`${origin}/api/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
    });
    expect(denied.status).toBe(401);
    const open = await fetch(`${origin}/api/mcp`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}`, accept: "text/event-stream" },
    });
    expect(open.status).toBe(405);
  });

  it("stays closed when the read token is unset", async () => {
    const previous = process.env.TRIGGER_READ_TOKEN;
    delete process.env.TRIGGER_READ_TOKEN;
    const closed = await listen({ current });
    const response = await fetch(`${closed.origin}/api/mcp`, { method: "POST" });
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("read_token_unconfigured");
    await close(closed.server);
    process.env.TRIGGER_READ_TOKEN = previous;
  });
});
