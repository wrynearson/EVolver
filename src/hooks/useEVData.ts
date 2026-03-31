import { useState, useEffect } from "react";
import type {
  BrandCoverageSummary,
  BrandPresenceCountry,
  CountryPresenceDetails,
  CountryCoverageSummary,
  EVPresenceData,
  RegionCoverageSummary,
} from "../types";
import type { FeatureCollection } from "geojson";

export interface EVDataSummary {
  visibleBrandLabel: string;
  brandCount: number;
  visibleCountryCount: number;
  lastUpdated: string;
}

const IGNORED_COVERAGE_REGIONS = new Set([
  "Antarctica",
  "Seven seas (open ocean)",
]);

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

export function normalizeCoverageRegion(regionName?: string | null): string | null {
  if (!regionName) {
    return null;
  }

  const normalizedRegionName = regionName.trim();

  if (!normalizedRegionName || IGNORED_COVERAGE_REGIONS.has(normalizedRegionName)) {
    return null;
  }

  if (
    normalizedRegionName === "North America" ||
    normalizedRegionName === "South America"
  ) {
    return "Americas";
  }

  return normalizedRegionName;
}

export function getCountryRegionLookup(
  countries: FeatureCollection,
): Record<string, string> {
  const lookup: Record<string, string> = {};

  for (const feature of countries.features) {
    const properties = feature.properties;
    const isoCode =
      typeof properties?.ISO_A3 === "string" ? properties.ISO_A3 : null;

    if (!isoCode || isoCode === "-99") {
      continue;
    }

    const regionName = normalizeCoverageRegion(
      typeof properties?.REGION_UN === "string"
        ? properties.REGION_UN
        : typeof properties?.CONTINENT === "string"
          ? properties.CONTINENT
          : null,
    );

    if (!regionName) {
      continue;
    }

    lookup[isoCode] = regionName;
  }

  return lookup;
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

export function filterPresenceDataToRegion(
  data: EVPresenceData,
  countryRegionLookup: Record<string, string>,
  regionName?: string,
): EVPresenceData {
  if (!regionName) {
    return data;
  }

  return {
    ...data,
    brands: Object.fromEntries(
      Object.entries(data.brands).map(([brandName, brand]) => [
        brandName,
        {
          ...brand,
          countries: Object.fromEntries(
            Object.entries(brand.countries).filter(
              ([isoCode]) => countryRegionLookup[isoCode] === regionName,
            ),
          ),
        },
      ]),
    ),
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

export function getCountryCoverageSummaries(
  data: EVPresenceData,
): CountryCoverageSummary[] {
  const countries = new Map<string, CountryCoverageSummary>();

  for (const [brandName, brand] of Object.entries(data.brands)) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (!entry.present) {
        continue;
      }

      const existingCountry = countries.get(isoCode) ?? {
        isoCode,
        countryName: entry.name || isoCode,
        confirmedBrandCount: 0,
        uncertainBrandCount: 0,
        brandNames: [],
      };

      existingCountry.countryName = entry.name || existingCountry.countryName;
      existingCountry.brandNames.push(brandName);

      if (entry.uncertain) {
        existingCountry.uncertainBrandCount += 1;
      } else {
        existingCountry.confirmedBrandCount += 1;
      }

      countries.set(isoCode, existingCountry);
    }
  }

  return Array.from(countries.values())
    .map((country) => ({
      ...country,
      brandNames: country.brandNames.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => {
      if (b.confirmedBrandCount !== a.confirmedBrandCount) {
        return b.confirmedBrandCount - a.confirmedBrandCount;
      }

      if (b.uncertainBrandCount !== a.uncertainBrandCount) {
        return b.uncertainBrandCount - a.uncertainBrandCount;
      }

      return a.countryName.localeCompare(b.countryName);
    });
}

export function getRegionCoverageSummaries(
  data: EVPresenceData,
  countryRegionLookup: Record<string, string>,
): RegionCoverageSummary[] {
  const regions = new Map<
    string,
    {
      confirmedCountries: Set<string>;
      uncertainCountries: Set<string>;
      brandNames: Set<string>;
    }
  >();

  for (const [brandName, brand] of Object.entries(data.brands)) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (!entry.present) {
        continue;
      }

      const regionName = countryRegionLookup[isoCode];

      if (!regionName) {
        continue;
      }

      const region = regions.get(regionName) ?? {
        confirmedCountries: new Set<string>(),
        uncertainCountries: new Set<string>(),
        brandNames: new Set<string>(),
      };

      region.brandNames.add(brandName);

      if (entry.uncertain) {
        region.uncertainCountries.add(isoCode);
      } else {
        region.confirmedCountries.add(isoCode);
      }

      regions.set(regionName, region);
    }
  }

  return Array.from(regions.entries())
    .map(([regionName, region]) => ({
      regionName,
      confirmedCountryCount: region.confirmedCountries.size,
      uncertainCountryCount: Array.from(region.uncertainCountries).filter(
        (isoCode) => !region.confirmedCountries.has(isoCode),
      ).length,
      brandNames: Array.from(region.brandNames).sort((a, b) =>
        a.localeCompare(b),
      ),
    }))
    .sort((a, b) => {
      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (b.brandNames.length !== a.brandNames.length) {
        return b.brandNames.length - a.brandNames.length;
      }

      if (b.uncertainCountryCount !== a.uncertainCountryCount) {
        return b.uncertainCountryCount - a.uncertainCountryCount;
      }

      return a.regionName.localeCompare(b.regionName);
    });
}
