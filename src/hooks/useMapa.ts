import { useEffect, useState } from "react";
import { getMapa } from "@/lib/api";
import type { HeatmapEstado } from "@/types/api";

export function useMapa() {
  const [data, setData] = useState<HeatmapEstado[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMapa()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
