import { describe, expect, it } from "vitest";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  filterPresenceDataToBrand,
  filterPresenceDataToRegion,
  getBrandMajorRegionGapSummaries,
  getBrandMajorRegionProgressSummaries,
  getBrandRegionCoverageSummaries,
  getCountryRegionBrandSuggestions,
  getCountryRegionLookup,
  getCountryCoverageSummaries,
  getRegionCoverageSummaries,
} from "../src/hooks/useEVData";
import type { EVPresenceData } from "../src/types";

const mockData: EVPresenceData = {
  metadata: {
    last_updated: "2026-03-31",
    definition: "test",
    schema_version: 2,
  },
  brands: {
    BYD: {
      website: "https://www.byd.com",
      countries: {
        NOR: {
          name: "Norway",
          present: true,
          source: "https://www.byd.com/no",
          uncertain: false,
        },
        CHN: {
          name: "China",
          present: true,
          source: "https://www.byd.com/cn",
          uncertain: false,
        },
      },
    },
    XPeng: {
      website: "https://www.xpeng.com",
      countries: {
        NOR: {
          name: "Norway",
          present: true,
          source: "https://www.xpeng.com/no",
          uncertain: false,
        },
        SWE: {
          name: "Sweden",
          present: true,
          source: "https://www.xpeng.com/se",
          uncertain: true,
        },
      },
    },
  },
};

const mockCountries = {
  type: "FeatureCollection",
  features: [
    {
      properties: { ISO_A3: "NOR", REGION_UN: "Europe", CONTINENT: "Europe" },
    },
    {
      properties: { ISO_A3: "CHN", REGION_UN: "Asia", CONTINENT: "Asia" },
    },
    {
      properties: { ISO_A3: "SWE", REGION_UN: "Europe", CONTINENT: "Europe" },
    },
  ],
} as const;

describe("useEVData helpers", () => {
  it("computes country counts and dataset summaries for filtered views", () => {
    expect(computeCountryBrandCounts(mockData)).toEqual({
      NOR: 2,
      CHN: 1,
      SWE: 1,
    });
    expect(computeCountryBrandCounts(mockData, "BYD")).toEqual({
      NOR: 1,
      CHN: 1,
    });
    expect(computeDatasetSummary(mockData, "XPeng")).toEqual({
      visibleBrandLabel: "XPeng",
      brandCount: 2,
      visibleCountryCount: 1,
      uncertainCountryCount: 1,
      lastUpdated: "2026-03-31",
    });
  });

  it("builds country coverage summaries sorted by strongest confirmed coverage", () => {
    expect(getCountryCoverageSummaries(mockData)).toEqual([
      {
        isoCode: "NOR",
        countryName: "Norway",
        confirmedBrandCount: 2,
        uncertainBrandCount: 0,
        brandNames: ["BYD", "XPeng"],
      },
      {
        isoCode: "CHN",
        countryName: "China",
        confirmedBrandCount: 1,
        uncertainBrandCount: 0,
        brandNames: ["BYD"],
      },
      {
        isoCode: "SWE",
        countryName: "Sweden",
        confirmedBrandCount: 0,
        uncertainBrandCount: 1,
        brandNames: ["XPeng"],
      },
    ]);
  });

  it("builds regional coverage summaries from country metadata", () => {
    const countryRegionLookup = getCountryRegionLookup(mockCountries);

    expect(getRegionCoverageSummaries(mockData, countryRegionLookup)).toEqual([
      {
        regionName: "Europe",
        confirmedCountryCount: 1,
        uncertainCountryCount: 1,
        brandNames: ["BYD", "XPeng"],
      },
      {
        regionName: "Asia",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
        brandNames: ["BYD"],
      },
    ]);
  });

  it("builds per-brand region summaries for footprint navigation", () => {
    const countryRegionLookup = getCountryRegionLookup(mockCountries);

    expect(
      getBrandRegionCoverageSummaries(mockData, "BYD", countryRegionLookup),
    ).toEqual([
      {
        regionName: "Asia",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
      },
      {
        regionName: "Europe",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
      },
    ]);
    expect(
      getBrandRegionCoverageSummaries(mockData, "XPeng", countryRegionLookup),
    ).toEqual([
      {
        regionName: "Europe",
        confirmedCountryCount: 1,
        uncertainCountryCount: 1,
      },
    ]);
  });

  it("falls back to ADM0_A3 codes and static region overrides for footprint lookups", () => {
    const fallbackCountries = {
      type: "FeatureCollection",
      features: [
        {
          properties: {
            ISO_A3: "-99",
            ADM0_A3: "FRA",
            REGION_UN: "Europe",
            CONTINENT: "Europe",
          },
        },
        {
          properties: {
            ISO_A3: "-99",
            ADM0_A3: "NOR",
            REGION_UN: "Europe",
            CONTINENT: "Europe",
          },
        },
        {
          properties: {
            ISO_A3: "CHN",
            REGION_UN: "Asia",
            CONTINENT: "Asia",
          },
        },
      ],
    } as const;

    const fallbackData: EVPresenceData = {
      metadata: {
        last_updated: "2026-05-16",
        definition: "test",
        schema_version: 2,
      },
      brands: {
        "MG (SAIC)": {
          website: "https://www.mgmotor.com",
          countries: {
            FRA: {
              name: "France",
              present: true,
              source: "https://www.mgmotor.fr/",
              uncertain: false,
            },
            NOR: {
              name: "Norway",
              present: true,
              source: "https://www.mgmotor.eu/nn-NO/",
              uncertain: false,
            },
            MUS: {
              name: "Mauritius",
              present: true,
              source: "https://mgmotor.mu/contact-us/",
              uncertain: false,
            },
            CHN: {
              name: "China",
              present: true,
              source: "https://www.mgmotor.com.cn",
              uncertain: false,
            },
          },
        },
      },
    };

    const countryRegionLookup = getCountryRegionLookup(fallbackCountries);

    expect(countryRegionLookup).toMatchObject({
      FRA: "Europe",
      NOR: "Europe",
      MUS: "Africa",
      CHN: "Asia",
    });
    expect(
      getBrandRegionCoverageSummaries(fallbackData, "MG (SAIC)", countryRegionLookup),
    ).toEqual([
      {
        regionName: "Europe",
        confirmedCountryCount: 2,
        uncertainCountryCount: 0,
      },
      {
        regionName: "Africa",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
      },
      {
        regionName: "Asia",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
      },
    ]);
  });

  it("highlights tracked brands that still miss major EV regions", () => {
    expect(getBrandMajorRegionGapSummaries(mockData)).toEqual([
      {
        brandName: "BYD",
        website: "https://www.byd.com",
        confirmedCountryCount: 2,
        coveredMajorRegionCount: 1,
        missingRegions: ["Southeast Asia", "Americas", "Middle East"],
      },
      {
        brandName: "XPeng",
        website: "https://www.xpeng.com",
        confirmedCountryCount: 1,
        coveredMajorRegionCount: 1,
        missingRegions: ["Southeast Asia", "Americas", "Middle East"],
      },
    ]);
  });

  it("builds major-region progress summaries for a selected brand", () => {
    expect(getBrandMajorRegionProgressSummaries(mockData, "BYD")).toEqual([
      {
        regionName: "Europe",
        confirmedCountryCount: 1,
        uncertainCountryCount: 0,
        totalCountryCount: 40,
      },
      {
        regionName: "Southeast Asia",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 11,
      },
      {
        regionName: "Americas",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 35,
      },
      {
        regionName: "Middle East",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 17,
      },
    ]);
    expect(getBrandMajorRegionProgressSummaries(mockData, "XPeng")).toEqual([
      {
        regionName: "Europe",
        confirmedCountryCount: 1,
        uncertainCountryCount: 1,
        totalCountryCount: 40,
      },
      {
        regionName: "Southeast Asia",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 11,
      },
      {
        regionName: "Americas",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 35,
      },
      {
        regionName: "Middle East",
        confirmedCountryCount: 0,
        uncertainCountryCount: 0,
        totalCountryCount: 17,
      },
    ]);
  });

  it("suggests nearby confirmed brands for empty-country views", () => {
    const countryRegionLookup = getCountryRegionLookup(mockCountries);

    expect(
      getCountryRegionBrandSuggestions(mockData, "SWE", countryRegionLookup),
    ).toEqual({
      regionName: "Europe",
      brands: [
        {
          brandName: "BYD",
          confirmedCountryCount: 1,
        },
        {
          brandName: "XPeng",
          confirmedCountryCount: 1,
        },
      ],
    });
    expect(
      getCountryRegionBrandSuggestions(mockData, "CHN", countryRegionLookup),
    ).toEqual({
      regionName: "Asia",
      brands: [],
    });
  });

  it("filters dataset entries down to a single region", () => {
    const countryRegionLookup = getCountryRegionLookup(mockCountries);
    const filteredData = filterPresenceDataToRegion(
      mockData,
      countryRegionLookup,
      "Europe",
    );

    expect(Object.keys(filteredData.brands.BYD.countries)).toEqual(["NOR"]);
    expect(Object.keys(filteredData.brands.XPeng.countries)).toEqual([
      "NOR",
      "SWE",
    ]);
    expect(computeDatasetSummary(filteredData)).toEqual({
      visibleBrandLabel: "All brands",
      brandCount: 2,
      visibleCountryCount: 1,
      uncertainCountryCount: 1,
      lastUpdated: "2026-03-31",
    });
  });

  it("filters dataset entries down to a single brand for scoped exports", () => {
    const filteredData = filterPresenceDataToBrand(mockData, "XPeng");

    expect(Object.keys(filteredData.brands)).toEqual(["XPeng"]);
    expect(filteredData.brands.XPeng.countries).toEqual(mockData.brands.XPeng.countries);
  });
});
