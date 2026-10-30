import { currentSnapshot } from "../src/observe/refresh.ts";

export default async function handler(
  _request: unknown,
  response: {
    setHeader(name: string, value: string): void;
    status(code: number): { end(body: string): void };
  },
) {
  const body = await currentSnapshot();
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.status(200).end(JSON.stringify(body));
}
