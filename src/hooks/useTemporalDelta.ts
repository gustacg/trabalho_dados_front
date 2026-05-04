import { useEffect, useState } from "react";
import { getTemporalDelta } from "@/lib/api";
import type { TemporalDelta } from "@/types/api";

export function useTemporalDelta(n: number = 50) {
  const [data, setData] = useState<TemporalDelta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTemporalDelta(n)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [n]);

  return { data, loading };
}
