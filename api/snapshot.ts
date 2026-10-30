export default async function handler() {
  try {
    const { currentSnapshot } = await import("../src/observe/refresh.ts");
    const body = await currentSnapshot();
    return new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "snapshot failed";
    return new Response(JSON.stringify({ snapshot: null, readFailed: true, error: message }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}
