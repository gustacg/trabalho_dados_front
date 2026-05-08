import { useEffect, useState } from "react";
import {
  getMlFeatureImportance,
  getMlLatest,
} from "@/lib/api";
import type {
  MlFeatureImportance,
  MlLatest,
  MlLatestApriori,
  MlLatestEmpty,
  MlLatestKmeans,
  MlLatestRandomForest,
} from "@/types/api";

function isEmpty(r: MlLatest): r is MlLatestEmpty {
  return (r as MlLatestEmpty).status === "no_data";
}

export function useMlRandomForest() {
  const [data, setData] = useState<MlLatestRandomForest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMlLatest("random_forest")
      .then((r) => setData(isEmpty(r) ? null : (r as MlLatestRandomForest)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useMlKmeans() {
  const [data, setData] = useState<MlLatestKmeans | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMlLatest("kmeans")
      .then((r) => setData(isEmpty(r) ? null : (r as MlLatestKmeans)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useMlApriori() {
  const [data, setData] = useState<MlLatestApriori | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMlLatest("apriori")
      .then((r) => setData(isEmpty(r) ? null : (r as MlLatestApriori)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useMlFeatureImportance() {
  const [data, setData] = useState<MlFeatureImportance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMlFeatureImportance()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
