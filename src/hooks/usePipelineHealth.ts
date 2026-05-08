import { useEffect, useState } from "react";
import { getPipelineHealth } from "@/lib/api";
import type { PipelineHealth } from "@/types/api";

export function usePipelineHealth(refreshMs: number = 60000) {
  const [data, setData] = useState<PipelineHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      setLoading(true);
      getPipelineHealth()
        .then((d) => alive && setData(d))
        .catch(() => alive && setData(null))
        .finally(() => alive && setLoading(false));
    };
    tick();
    const t = window.setInterval(tick, refreshMs);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [refreshMs]);

  return { data, loading };
}
