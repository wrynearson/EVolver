import { useState, useEffect } from "react";
import type {
  BrandCoverageSummary,
  BrandPresenceCountry,
  CountryPresenceDetails,
  EVPresenceData,
} from "../types";

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

export function getCountryPresenceDetails(
  data: EVPresenceData,
  isoCode: string,
  brandName?: string,
  fallbackCountryName?: string,
): CountryPresenceDetails | null {
  const brands = brandName
    ? Object.entries(data.brands).filter(([name]) => name === brandName)
    : Object.entries(data.brands);
  const visibleBrands = [];
  let countryName = fallbackCountryName ?? isoCode;

  for (const [name, brand] of brands) {
    const entry = brand.countries[isoCode];
    if (!entry?.present) {
      continue;
    }

    countryName = entry.name || countryName;
    visibleBrands.push({
      brandName: name,
      website: brand.website,
      source: entry.source,
      sources: Array.from(
        new Set(entry.sources ?? (entry.source ? [entry.source] : [])),
      ),
      uncertain: entry.uncertain,
    });
  }

  if (visibleBrands.length === 0) {
    return null;
  }

  return {
    isoCode,
    countryName,
    brands: visibleBrands.sort((a, b) => a.brandName.localeCompare(b.brandName)),
  };
}

export function getBrandPresenceCountries(
  data: EVPresenceData,
  brandName: string,
): BrandPresenceCountry[] {
  const brand = data.brands[brandName];

  if (!brand) {
    return [];
  }

  return Object.entries(brand.countries)
    .filter(([, entry]) => entry.present)
    .map(([isoCode, entry]) => ({
      isoCode,
      countryName: entry.name || isoCode,
      source: entry.source,
      sources: Array.from(
        new Set(entry.sources ?? (entry.source ? [entry.source] : [])),
      ),
      uncertain: entry.uncertain,
    }))
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
}

export function getBrandCoverageSummaries(
  data: EVPresenceData,
): BrandCoverageSummary[] {
  return Object.entries(data.brands)
    .map(([brandName, brand]) => {
      let confirmedCountryCount = 0;
      let uncertainCountryCount = 0;

      for (const entry of Object.values(brand.countries)) {
        if (!entry.present) {
          continue;
        }

        if (entry.uncertain) {
          uncertainCountryCount += 1;
        } else {
          confirmedCountryCount += 1;
        }
      }

      return {
        brandName,
        website: brand.website,
        confirmedCountryCount,
        uncertainCountryCount,
      };
    })
    .sort((a, b) => {
      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (a.uncertainCountryCount !== b.uncertainCountryCount) {
        return a.uncertainCountryCount - b.uncertainCountryCount;
      }

      return a.brandName.localeCompare(b.brandName);
    });
}
