type NodeResponse = {
  setHeader(name: string, value: string): void;
  end(body: string): void;
  statusCode: number;
};

export default async function handler(_request: unknown, response: NodeResponse) {
  try {
    const { currentSnapshot } = await import("../src/observe/refresh.ts");
    const body = await currentSnapshot();
    response.statusCode = 200;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "snapshot failed";
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ snapshot: null, readFailed: true, error: message }));
  }
}
