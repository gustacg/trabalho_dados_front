import { useEffect, useState } from "react";
import { getCommunities } from "@/lib/api";
import type { CommunityObservada } from "@/types/api";

export function useCommunities(opts?: { limit?: number; apenasBlackhole?: boolean }) {
  const [data, setData] = useState<CommunityObservada[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCommunities(opts)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [opts?.limit, opts?.apenasBlackhole]);

  return { data, loading };
}
