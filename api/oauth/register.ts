import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRegister } from "../../src/observe/external/oauth.ts";

export const config = { api: { bodyParser: false } };

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleRegister(req, res);
}
