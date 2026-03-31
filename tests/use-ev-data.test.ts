import { describe, expect, it } from "vitest";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  getCountryCoverageSummaries,
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
});
