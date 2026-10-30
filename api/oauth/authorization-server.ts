import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAuthorizationServer } from "../../src/observe/external/oauth.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleAuthorizationServer(req, res);
}