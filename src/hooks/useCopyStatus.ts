import { useEffect, useRef, useState, type DependencyList } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

export function useCopyStatus(resetDeps: DependencyList, autoResetMs = 1500) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setStatus("idle");
  }, resetDeps);

  useEffect(() => {
    if (status === "idle" || typeof window === "undefined") {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setStatus("idle");
    }, autoResetMs);

    return () => window.clearTimeout(resetTimer);
  }, [autoResetMs, status]);

  return [status, setStatus] as const;
}
