export default async function handler() {
  return new Response(JSON.stringify({ ok: true, probe: "snapshot-handler" }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
