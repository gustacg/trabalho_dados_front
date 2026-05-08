import { useEffect, useState } from "react";
import { getEngenhariaTrafego } from "@/lib/api";
import type { EngenhariaTrafego } from "@/types/api";

export function useEngenhariaTrafego(snapshotId?: number | "latest" | "all") {
  const [data, setData] = useState<EngenhariaTrafego[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEngenhariaTrafego(snapshotId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { data, loading };
}
