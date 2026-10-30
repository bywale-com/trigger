import { nodeHandler } from "../../src/observe/external/node-handler.ts";

export const config = { api: { bodyParser: false } };

export default nodeHandler(async () => {
  const { handleAuthorize } = await import("../../src/observe/external/oauth.ts");
  return handleAuthorize;
});
