/** Node handler wrapper. Surfaces a thrown request error as JSON instead of an empty platform 500. */
import type { IncomingMessage, ServerResponse } from "node:http";

export function nodeHandler(
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
) {
  return async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
      await handle(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      try {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: { code: "internal", message: message.slice(0, 300) } }));
        }
      } catch {
        // The platform response could not be written.
      }
    }
  };
}
