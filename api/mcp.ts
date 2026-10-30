import type { IncomingMessage, ServerResponse } from "node:http";
import { handleMcp } from "../src/observe/external/mcp.ts";

export const config = { api: { bodyParser: false } };

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleMcp(req, res);
}
