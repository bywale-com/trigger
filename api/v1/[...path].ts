import type { IncomingMessage, ServerResponse } from "node:http";
import { handleV1 } from "../../src/observe/external/v1.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleV1(req, res);
}
