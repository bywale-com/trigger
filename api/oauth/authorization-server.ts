import { nodeHandler } from "../../src/observe/external/node-handler.ts";

export default nodeHandler(async () => {
  const { handleAuthorizationServer } = await import("../../src/observe/external/oauth.ts");
  return handleAuthorizationServer;
});
