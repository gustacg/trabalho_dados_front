import { useEffect, useState } from "react";
import { getTimeline } from "@/lib/api";
import type { TimelineBucket } from "@/types/api";

export function useTimeline(opts?: { days?: number; estado?: string; regiao?: string }) {
  const [data, setData] = useState<TimelineBucket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTimeline(opts)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [opts?.days, opts?.estado, opts?.regiao]);

  return { data, loading };
}
