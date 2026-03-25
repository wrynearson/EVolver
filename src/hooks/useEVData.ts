import { useState, useEffect } from "react";
import type { EVPresenceData } from "../types";

export interface EVDataSummary {
  visibleBrandLabel: string;
  brandCount: number;
  visibleCountryCount: number;
  lastUpdated: string;
}

/**
 * Loads ev-presence.json and computes per-country brand counts.
 * Returns the raw data plus a map of ISO_A3 -> number of brands present.
 */
export function useEVData() {
  const [data, setData] = useState<EVPresenceData | null>(null);
  const [countryBrandCount, setCountryBrandCount] = useState<
    Record<string, number>
  >({});
  const [summary, setSummary] = useState<EVDataSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/ev-presence.json")
      .then((res) => res.json())
      .then((json: EVPresenceData) => {
        setData(json);
        setCountryBrandCount(computeCountryBrandCounts(json));
        setSummary(computeDatasetSummary(json));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load EV presence data:", err);
        setLoading(false);
      });
  }, []);

  return { data, countryBrandCount, summary, loading };
}

/**
 * For each country ISO code, count how many brands are present there.
 * Only counts entries where present === true.
 */
export function computeCountryBrandCounts(
  data: EVPresenceData,
  brandName?: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  const brands = brandName
    ? Object.entries(data.brands).filter(([name]) => name === brandName)
    : Object.entries(data.brands);

  for (const [, brand] of brands) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (entry.present) {
        counts[isoCode] = (counts[isoCode] || 0) + 1;
      }
    }
  }

  return counts;
}

export function computeDatasetSummary(
  data: EVPresenceData,
  brandName?: string,
): EVDataSummary {
  const confirmedCountries = new Set<string>();
  const brands = brandName
    ? Object.entries(data.brands).filter(([name]) => name === brandName)
    : Object.entries(data.brands);

  for (const [, brand] of brands) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (entry.present && !entry.uncertain) {
        confirmedCountries.add(isoCode);
      }
    }
  }

  return {
    visibleBrandLabel: brandName ?? "All brands",
    brandCount: Object.keys(data.brands).length,
    visibleCountryCount: confirmedCountries.size,
    lastUpdated: data.metadata.last_updated,
  };
}
