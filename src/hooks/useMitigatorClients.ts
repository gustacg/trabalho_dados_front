import { useEffect, useState } from "react";
import { getClientesDeMitigador } from "@/lib/api";
import type { ClientesMitigador } from "@/types/api";

export function useMitigatorClients(mitigadorAsn: number | null, snapshotId?: number | "latest") {
  const [data, setData] = useState<ClientesMitigador | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mitigadorAsn === null) return;
    setLoading(true);
    getClientesDeMitigador(mitigadorAsn, snapshotId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [mitigadorAsn, snapshotId]);

  return { data, loading };
}
