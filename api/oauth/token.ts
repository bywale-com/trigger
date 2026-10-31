import { nodeHandler } from "../../src/observe/external/node-handler.ts";
import { handleToken } from "../../src/observe/external/oauth.ts";

export const config = { runtime: "nodejs", api: { bodyParser: false } };

export default nodeHandler((req, res) => handleToken(req, res));
