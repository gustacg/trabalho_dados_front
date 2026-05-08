import { useEffect, useState } from "react";
import { getPathSpecificity } from "@/lib/api";
import type { PathSpecificity } from "@/types/api";

export function usePathSpecificity(snapshotId?: number | "latest" | "all") {
  const [data, setData] = useState<PathSpecificity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPathSpecificity(snapshotId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [snapshotId]);

  return { data, loading };
}
