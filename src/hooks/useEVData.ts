import { useState, useEffect } from "react";
import type {
  BrandCoverageSummary,
  BrandMajorRegionGapSummary,
  BrandMajorRegionProgressSummary,
  BrandPresenceCountry,
  BrandRegionCoverageSummary,
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
  uncertainCountryCount: number;
  lastUpdated: string;
}

const IGNORED_COVERAGE_REGIONS = new Set([
  "Antarctica",
  "Seven seas (open ocean)",
]);

const COUNTRY_REGION_OVERRIDES: Record<string, string> = {
  ATG: "Americas",
  BHR: "Asia",
  BRB: "Americas",
  GRD: "Americas",
  KNA: "Americas",
  LCA: "Americas",
  MLT: "Europe",
  MUS: "Africa",
  SGP: "Asia",
  VCT: "Americas",
};

const MAJOR_EV_REGION_ORDER = [
  "Europe",
  "Southeast Asia",
  "Americas",
  "Middle East",
] as const;

const MAJOR_EV_REGION_COUNTRIES: Record<
  (typeof MAJOR_EV_REGION_ORDER)[number],
  string[]
> = {
  Europe: [
    "ALB",
    "AND",
    "AUT",
    "BEL",
    "BIH",
    "BGR",
    "BLR",
    "CHE",
    "CYP",
    "CZE",
    "DEU",
    "DNK",
    "ESP",
    "EST",
    "FIN",
    "FRA",
    "GBR",
    "GRC",
    "HRV",
    "HUN",
    "IRL",
    "ISL",
    "ITA",
    "LTU",
    "LUX",
    "LVA",
    "MDA",
    "MKD",
    "MLT",
    "MNE",
    "NLD",
    "NOR",
    "POL",
    "PRT",
    "ROU",
    "SRB",
    "SVK",
    "SVN",
    "SWE",
    "UKR",
  ],
  "Southeast Asia": [
    "BRN",
    "IDN",
    "KHM",
    "LAO",
    "MMR",
    "MYS",
    "PHL",
    "SGP",
    "THA",
    "TLS",
    "VNM",
  ],
  Americas: [
    "ATG",
    "ARG",
    "BHS",
    "BLZ",
    "BOL",
    "BRA",
    "BRB",
    "CAN",
    "CHL",
    "COL",
    "CRI",
    "CUB",
    "DMA",
    "DOM",
    "ECU",
    "GRD",
    "GTM",
    "GUY",
    "HND",
    "HTI",
    "JAM",
    "KNA",
    "LCA",
    "MEX",
    "NIC",
    "PAN",
    "PER",
    "PRY",
    "SLV",
    "SUR",
    "TTO",
    "URY",
    "USA",
    "VCT",
    "VEN",
  ],
  "Middle East": [
    "ARE",
    "ARM",
    "AZE",
    "BHR",
    "CYP",
    "EGY",
    "GEO",
    "IRQ",
    "ISR",
    "JOR",
    "KWT",
    "LBN",
    "OMN",
    "QAT",
    "SAU",
    "SYR",
    "TUR",
  ],
};

const MAJOR_EV_REGION_BY_COUNTRY: Record<string, (typeof MAJOR_EV_REGION_ORDER)[number]> =
  Object.fromEntries(
    Object.entries(MAJOR_EV_REGION_COUNTRIES).flatMap(([regionName, countries]) =>
      countries.map((isoCode) => [isoCode, regionName]),
    ),
  ) as Record<string, (typeof MAJOR_EV_REGION_ORDER)[number]>;

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
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setData(null);
    setCountryBrandCount({});
    setSummary(null);

    fetch(import.meta.env.BASE_URL + "data/ev-presence.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
      })
      .then((json: EVPresenceData) => {
        if (cancelled) {
          return;
        }

        setData(json);
        setCountryBrandCount(computeCountryBrandCounts(json));
        setSummary(computeDatasetSummary(json));
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to load EV presence data:", err);
        setError("The verified EV presence dataset could not be loaded.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestVersion]);

  return {
    data,
    countryBrandCount,
    summary,
    loading,
    error,
    retry: () => setRequestVersion((currentVersion) => currentVersion + 1),
  };
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
  if (countries.features.length === 0) {
    return {};
  }

  const lookup: Record<string, string> = { ...COUNTRY_REGION_OVERRIDES };

  for (const feature of countries.features) {
    const properties = feature.properties;
    const isoCode =
      typeof properties?.ISO_A3 === "string" && properties.ISO_A3 !== "-99"
        ? properties.ISO_A3
        : typeof properties?.ADM0_A3 === "string" && properties.ADM0_A3 !== "-99"
          ? properties.ADM0_A3
          : null;

    if (!isoCode) {
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
  const uncertainCountries = new Set<string>();
  const brands = brandName
    ? Object.entries(data.brands).filter(([name]) => name === brandName)
    : Object.entries(data.brands);

  for (const [, brand] of brands) {
    for (const [isoCode, entry] of Object.entries(brand.countries)) {
      if (!entry.present) {
        continue;
      }

      if (entry.uncertain) {
        uncertainCountries.add(isoCode);
      } else {
        confirmedCountries.add(isoCode);
      }
    }
  }

  return {
    visibleBrandLabel: brandName ?? "All brands",
    brandCount: Object.keys(data.brands).length,
    visibleCountryCount: confirmedCountries.size,
    uncertainCountryCount: uncertainCountries.size,
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

export function filterPresenceDataToBrand(
  data: EVPresenceData,
  brandName?: string,
): EVPresenceData {
  if (!brandName) {
    return data;
  }

  const brand = data.brands[brandName];

  return {
    ...data,
    brands: brand ? { [brandName]: brand } : {},
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

export function getCountryRegionBrandSuggestions(
  data: EVPresenceData,
  isoCode: string,
  countryRegionLookup: Record<string, string>,
) {
  const regionName = countryRegionLookup[isoCode];

  if (!regionName) {
    return null;
  }

  const brands = Object.entries(data.brands)
    .map(([brandName, brand]) => {
      let confirmedCountryCount = 0;

      for (const [countryIsoCode, entry] of Object.entries(brand.countries)) {
        if (
          !entry.present ||
          entry.uncertain ||
          countryIsoCode === isoCode ||
          countryRegionLookup[countryIsoCode] !== regionName
        ) {
          continue;
        }

        confirmedCountryCount += 1;
      }

      return confirmedCountryCount > 0
        ? {
            brandName,
            confirmedCountryCount,
          }
        : null;
    })
    .filter((brand): brand is { brandName: string; confirmedCountryCount: number } =>
      Boolean(brand),
    )
    .sort((a, b) => {
      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      return a.brandName.localeCompare(b.brandName);
    });

  return {
    regionName,
    brands,
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

export function getBrandRegionCoverageSummaries(
  data: EVPresenceData,
  brandName: string,
  countryRegionLookup: Record<string, string>,
): BrandRegionCoverageSummary[] {
  const brand = data.brands[brandName];

  if (!brand) {
    return [];
  }

  const summaries = new Map<
    string,
    { confirmedCountryCount: number; uncertainCountryCount: number }
  >();

  for (const [isoCode, entry] of Object.entries(brand.countries)) {
    if (!entry.present) {
      continue;
    }

    const regionName = countryRegionLookup[isoCode];

    if (!regionName) {
      continue;
    }

    const summary = summaries.get(regionName) ?? {
      confirmedCountryCount: 0,
      uncertainCountryCount: 0,
    };

    if (entry.uncertain) {
      summary.uncertainCountryCount += 1;
    } else {
      summary.confirmedCountryCount += 1;
    }

    summaries.set(regionName, summary);
  }

  return Array.from(summaries.entries())
    .map(([regionName, summary]) => ({
      regionName,
      confirmedCountryCount: summary.confirmedCountryCount,
      uncertainCountryCount: summary.uncertainCountryCount,
    }))
    .sort((a, b) => {
      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (b.uncertainCountryCount !== a.uncertainCountryCount) {
        return b.uncertainCountryCount - a.uncertainCountryCount;
      }

      return a.regionName.localeCompare(b.regionName);
    });
}

export function getBrandMajorRegionGapSummaries(
  data: EVPresenceData,
): BrandMajorRegionGapSummary[] {
  return Object.entries(data.brands)
    .map(([brandName, brand]) => {
      const coveredMajorRegions = new Set<string>();
      let confirmedCountryCount = 0;

      for (const [isoCode, entry] of Object.entries(brand.countries)) {
        if (!entry.present || entry.uncertain) {
          continue;
        }

        confirmedCountryCount += 1;

        const majorRegionName = MAJOR_EV_REGION_BY_COUNTRY[isoCode];

        if (majorRegionName) {
          coveredMajorRegions.add(majorRegionName);
        }
      }

      const missingRegions = MAJOR_EV_REGION_ORDER.filter(
        (regionName) => !coveredMajorRegions.has(regionName),
      );

      return {
        brandName,
        website: brand.website,
        confirmedCountryCount,
        coveredMajorRegionCount: coveredMajorRegions.size,
        missingRegions,
      };
    })
    .filter((brand) => brand.missingRegions.length > 0)
    .sort((a, b) => {
      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (b.missingRegions.length !== a.missingRegions.length) {
        return b.missingRegions.length - a.missingRegions.length;
      }

      return a.brandName.localeCompare(b.brandName);
    });
}

export function getBrandMajorRegionProgressSummaries(
  data: EVPresenceData,
  brandName: string,
): BrandMajorRegionProgressSummary[] {
  const brand = data.brands[brandName];

  if (!brand) {
    return [];
  }

  return MAJOR_EV_REGION_ORDER.map((regionName) => {
    let confirmedCountryCount = 0;
    let uncertainCountryCount = 0;

    for (const isoCode of MAJOR_EV_REGION_COUNTRIES[regionName]) {
      const entry = brand.countries[isoCode];

      if (!entry?.present) {
        continue;
      }

      if (entry.uncertain) {
        uncertainCountryCount += 1;
      } else {
        confirmedCountryCount += 1;
      }
    }

    return {
      regionName,
      confirmedCountryCount,
      uncertainCountryCount,
      totalCountryCount: MAJOR_EV_REGION_COUNTRIES[regionName].length,
    };
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
