/**
 * Independent MCP client against a running Trigger.
 * TRIGGER_READ_TOKEN is required. MCP_URL defaults to the local server.
 * SNAPSHOT_URL, when set, is compared to the tool result. It stays the public desk read.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const token = process.env.TRIGGER_READ_TOKEN?.trim();
const mcpUrl = process.env.MCP_URL ?? "http://127.0.0.1:4173/api/mcp";
const snapshotUrl = process.env.SNAPSHOT_URL ?? "";

if (!token) {
  console.error("TRIGGER_READ_TOKEN is required");
  process.exit(1);
}

function textOf(result) {
  const content = result?.content;
  if (!Array.isArray(content) || typeof content[0]?.text !== "string") {
    throw new Error("tool result had no text");
  }
  return JSON.parse(content[0].text);
}

const denied = await fetch(mcpUrl, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: "{}",
});
if (denied.status !== 401 && denied.status !== 503) {
  console.error(`unauthenticated MCP returned ${denied.status}, expected 401 or 503`);
  process.exit(1);
}

const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
  requestInit: { headers: { authorization: `Bearer ${token}` } },
});
const client = new Client({ name: "trigger-walk", version: "1.0.0" });
await client.connect(transport);
const tools = await client.listTools();
const names = tools.tools.map((tool) => tool.name).sort();
const status = textOf(await client.callTool({ name: "get_factory_status", arguments: {} }));
const initiatives = textOf(await client.callTool({ name: "list_initiatives", arguments: {} }));
const packets = textOf(await client.callTool({ name: "list_packets", arguments: {} }));
const packetId = packets.data?.[0]?.id;
if (!packetId) throw new Error("no packet on this snapshot");
const packet = textOf(await client.callTool({ name: "get_packet", arguments: { id: packetId } }));
const execution = textOf(await client.callTool({ name: "get_execution", arguments: { id: packetId } }));
const next = textOf(await client.callTool({ name: "get_next_actions", arguments: {} }));
if (next.data?.timing?.nextAt !== null) throw new Error("nextAt was invented");
if (snapshotUrl) {
  const snapshot = await fetch(snapshotUrl).then((response) => response.json());
  if (snapshot.snapshot?.sha !== status.sha) throw new Error("tool sha does not match the desk snapshot");
}
await client.close();

console.log(JSON.stringify({
  mcp: mcpUrl,
  tools: names,
  sha: status.sha,
  stale: status.stale,
  reason: status.data?.pulse?.reason,
  initiatives: initiatives.data?.map((row) => row.id),
  packet: packet.data?.id,
  executionActivity: execution.data?.activity,
  githubAvailable: execution.data?.github?.available,
  nextAt: next.data?.timing?.nextAt,
  timingKnown: next.data?.timing?.known,
  timingBasis: next.data?.timing?.basis,
}, null, 2));
