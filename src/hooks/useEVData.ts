import { useState, useEffect } from "react";
import type { EVPresenceData } from "../types";

/**
 * Loads ev-presence.json and computes per-country brand counts.
 * Returns the raw data plus a map of ISO_A3 -> number of brands present.
 */
export function useEVData() {
  const [data, setData] = useState<EVPresenceData | null>(null);
  const [countryBrandCount, setCountryBrandCount] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/ev-presence.json")
      .then((res) => res.json())
      .then((json: EVPresenceData) => {
        setData(json);
        setCountryBrandCount(computeCountryBrandCounts(json));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load EV presence data:", err);
        setLoading(false);
      });
  }, []);

  return { data, countryBrandCount, loading };
}

/**
 * For each country ISO code, count how many brands are present there.
 * Only counts entries where present === true.
 */
export function computeCountryBrandCounts(
  data: EVPresenceData,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const brand of Object.values(data.brands)) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (entry.present) {
        counts[isoCode] = (counts[isoCode] || 0) + 1;
      }
    }
  }

  return counts;
}
