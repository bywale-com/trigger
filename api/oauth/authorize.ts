import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { handleAuthorize } = await import("../../src/observe/external/oauth.js");
    await handleAuthorize(req, res);
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : "request failed";
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: { code: "internal", message: message.slice(0, 500) } }));
    }
  }
}
