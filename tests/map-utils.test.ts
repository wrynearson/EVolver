import { describe, it, expect } from "vitest";
import { buildColorExpression } from "../src/lib/mapUtils";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
} from "../src/hooks/useEVData";
import type { EVPresenceData } from "../src/types";

describe("buildColorExpression", () => {
  it("returns transparent when no countries have brands", () => {
    const result = buildColorExpression({});
    expect(result).toBe("rgba(0,0,0,0)");
  });

  it("builds a match expression for countries with brands", () => {
    const result = buildColorExpression({ NOR: 1, DEU: 3, CHN: 5 });
    expect(Array.isArray(result)).toBe(true);

    const expr = result as unknown[];
    // Should be ["match", ["get", "ISO_A3"], ...pairs, fallback]
    expect(expr[0]).toBe("match");
    expect(expr[1]).toEqual(["get", "ISO_A3"]);
    // Last element is the fallback
    expect(expr[expr.length - 1]).toBe("rgba(0,0,0,0)");
  });

  it("assigns correct colors by count tier", () => {
    const result = buildColorExpression({ A: 1, B: 2, C: 4 }) as unknown[];
    // Find color for each key
    const getColor = (key: string) => {
      const idx = result.indexOf(key);
      return idx >= 0 ? result[idx + 1] : undefined;
    };
    expect(getColor("A")).toBe("#93c5fd"); // 1 = light blue
    expect(getColor("B")).toBe("#3b82f6"); // 2 = medium blue
    expect(getColor("C")).toBe("#1d4ed8"); // 4 = dark blue
  });
});

describe("computeCountryBrandCounts", () => {
  it("counts brands per country correctly", () => {
    const data: EVPresenceData = {
      metadata: {
        last_updated: "2026-01-01",
        definition: "test",
        schema_version: 1,
      },
      brands: {
        BrandA: {
          website: "https://a.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://a.com/no",
              uncertain: false,
            },
            DEU: {
              name: "Germany",
              present: false,
              source: null,
              uncertain: true,
            },
          },
        },
        BrandB: {
          website: "https://b.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://b.com/no",
              uncertain: false,
            },
          },
        },
      },
    };

    const counts = computeCountryBrandCounts(data);
    expect(counts.NOR).toBe(2); // Both brands present
    expect(counts.DEU).toBeUndefined(); // Not present
  });

  it("returns empty object for data with no present entries", () => {
    const data: EVPresenceData = {
      metadata: {
        last_updated: "2026-01-01",
        definition: "test",
        schema_version: 1,
      },
      brands: {
        BrandA: {
          website: "https://a.com",
          countries: {
            NOR: {
              name: "Norway",
              present: false,
              source: null,
              uncertain: true,
            },
          },
        },
      },
    };

    const counts = computeCountryBrandCounts(data);
    expect(Object.keys(counts)).toHaveLength(0);
  });

  it("filters counts to a single brand when requested", () => {
    const data: EVPresenceData = {
      metadata: {
        last_updated: "2026-01-01",
        definition: "test",
        schema_version: 2,
      },
      brands: {
        BrandA: {
          website: "https://a.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://a.com/no",
              uncertain: false,
            },
          },
        },
        BrandB: {
          website: "https://b.com",
          countries: {
            SWE: {
              name: "Sweden",
              present: true,
              source: "https://b.com/se",
              uncertain: false,
            },
          },
        },
      },
    };

    expect(computeCountryBrandCounts(data, "BrandB")).toEqual({ SWE: 1 });
  });
});

describe("computeDatasetSummary", () => {
  it("returns tracked brand count, visible country coverage, and last update", () => {
    const data: EVPresenceData = {
      metadata: {
        last_updated: "2026-03-13",
        definition: "test",
        schema_version: 2,
      },
      brands: {
        BrandA: {
          website: "https://a.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://a.com/no",
              uncertain: false,
            },
            DEU: {
              name: "Germany",
              present: true,
              source: "https://a.com/de",
              uncertain: true,
            },
          },
        },
        BrandB: {
          website: "https://b.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://b.com/no",
              uncertain: false,
            },
            SWE: {
              name: "Sweden",
              present: true,
              source: "https://b.com/se",
              uncertain: false,
            },
          },
        },
      },
    };

    expect(computeDatasetSummary(data)).toEqual({
      visibleBrandLabel: "All brands",
      brandCount: 2,
      visibleCountryCount: 2,
      lastUpdated: "2026-03-13",
    });
  });

  it("summarizes a single brand scope when filtered", () => {
    const data: EVPresenceData = {
      metadata: {
        last_updated: "2026-03-13",
        definition: "test",
        schema_version: 2,
      },
      brands: {
        BrandA: {
          website: "https://a.com",
          countries: {
            NOR: {
              name: "Norway",
              present: true,
              source: "https://a.com/no",
              uncertain: false,
            },
            DEU: {
              name: "Germany",
              present: true,
              source: "https://a.com/de",
              uncertain: true,
            },
          },
        },
        BrandB: {
          website: "https://b.com",
          countries: {
            SWE: {
              name: "Sweden",
              present: true,
              source: "https://b.com/se",
              uncertain: false,
            },
          },
        },
      },
    };

    expect(computeDatasetSummary(data, "BrandA")).toEqual({
      visibleBrandLabel: "BrandA",
      brandCount: 2,
      visibleCountryCount: 1,
      lastUpdated: "2026-03-13",
    });
  });
});
