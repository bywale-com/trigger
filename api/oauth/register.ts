import { nodeHandler } from "../../src/observe/external/node-handler.ts";

export const config = { api: { bodyParser: false } };

export default nodeHandler(async () => {
  const { handleRegister } = await import("../../src/observe/external/oauth.ts");
  return handleRegister;
});
