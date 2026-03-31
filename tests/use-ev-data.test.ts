import { describe, expect, it } from "vitest";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  filterPresenceDataToBrand,
  filterPresenceDataToRegion,
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
      lastUpdated: "2026-03-31",
    });
  });

  it("filters dataset entries down to a single brand for scoped exports", () => {
    const filteredData = filterPresenceDataToBrand(mockData, "XPeng");

    expect(Object.keys(filteredData.brands)).toEqual(["XPeng"]);
    expect(filteredData.brands.XPeng.countries).toEqual(mockData.brands.XPeng.countries);
  });
});
