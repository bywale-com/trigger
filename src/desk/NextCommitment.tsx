import { useEffect, useState } from "react";
import { commitmentLine, type Commitment } from "../observe/tower/commitment.ts";

/** Next column. The words are the commitment. The countdown is `checkAt` minus the clock. */
export function NextCommitment({
  commitment,
  unknown,
  testId,
}: {
  commitment: Commitment;
  unknown?: boolean;
  testId?: string;
}) {
  const [now, setNow] = useState(() => new Date().toISOString());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().toISOString()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const text =
    unknown ? "Unknown" : commitmentLine(commitment, now);
  return (
    <span className="desk-sentence" title={text} data-testid={testId}>
      {text}
    </span>
  );
}
