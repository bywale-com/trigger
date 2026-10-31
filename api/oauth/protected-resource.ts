import { nodeHandler } from "../../src/observe/external/node-handler.ts";
import { handleProtectedResource } from "../../src/observe/external/oauth.ts";

export const config = { runtime: "nodejs" };

export default nodeHandler((req, res) => handleProtectedResource(req, res));
