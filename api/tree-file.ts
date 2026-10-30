import { treeFileResult } from "../src/observe/tree-file.ts";

type NodeRequest = { url?: string };
type NodeResponse = {
  setHeader(name: string, value: string): void;
  end(body: Buffer | string): void;
  statusCode: number;
};

export default async function handler(request: NodeRequest, response: NodeResponse) {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  const result = await treeFileResult(url.searchParams.get("path"));
  response.statusCode = result.status;
  response.setHeader("content-type", result.contentType);
  if (result.cacheControl) response.setHeader("cache-control", result.cacheControl);
  response.end(result.body);
}
