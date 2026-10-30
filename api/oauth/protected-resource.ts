import type { IncomingMessage, ServerResponse } from "node:http";
import { handleProtectedResource } from "../../src/observe/external/oauth.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleProtectedResource(req, res);
}
