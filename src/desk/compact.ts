import { useEffect, useState } from "react";

/** Below Ant `lg`. 360–768 use the compact shell. 1440 does not. */
export const COMPACT_QUERY = "(max-width: 991px)";

export function useCompact(): boolean {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(COMPACT_QUERY).matches;
  });
  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return compact;
}
