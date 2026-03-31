import { describe, expect, it } from "vitest";
import {
  buildPresenceExportFileBaseName,
  buildPresenceExportRows,
  serializePresenceDataToCsv,
  serializePresenceDataToJson,
} from "../src/lib/dataExport";
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
          sources: ["https://www.byd.com/no", "https://www.byd.com/no/dealers"],
          uncertain: false,
        },
      },
    },
    XPeng: {
      website: "https://www.xpeng.com",
      countries: {
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

describe("data export helpers", () => {
  it("builds sorted export rows with region and source details", () => {
    expect(
      buildPresenceExportRows(mockData, { NOR: "Europe", SWE: "Europe" }),
    ).toEqual([
      {
        brandName: "BYD",
        brandWebsite: "https://www.byd.com",
        isoCode: "NOR",
        countryName: "Norway",
        regionName: "Europe",
        present: true,
        uncertain: false,
        primarySource: "https://www.byd.com/no",
        sourceUrls: ["https://www.byd.com/no", "https://www.byd.com/no/dealers"],
      },
      {
        brandName: "XPeng",
        brandWebsite: "https://www.xpeng.com",
        isoCode: "SWE",
        countryName: "Sweden",
        regionName: "Europe",
        present: true,
        uncertain: true,
        primarySource: "https://www.xpeng.com/se",
        sourceUrls: ["https://www.xpeng.com/se"],
      },
    ]);
  });

  it("serializes filtered presence data to csv", () => {
    expect(serializePresenceDataToCsv(mockData, { NOR: "Europe", SWE: "Europe" }))
      .toContain(
        "brand,brand_website,country_iso,country_name,region,present,uncertain,primary_source,source_urls",
      );
    expect(serializePresenceDataToCsv(mockData, { NOR: "Europe", SWE: "Europe" }))
      .toContain(
        "BYD,https://www.byd.com,NOR,Norway,Europe,true,false,https://www.byd.com/no,https://www.byd.com/no | https://www.byd.com/no/dealers",
      );
    expect(serializePresenceDataToCsv(mockData, { NOR: "Europe", SWE: "Europe" }))
      .toContain(
        "XPeng,https://www.xpeng.com,SWE,Sweden,Europe,true,true,https://www.xpeng.com/se,https://www.xpeng.com/se",
      );
  });

  it("serializes filtered presence data to json and builds readable file names", () => {
    expect(JSON.parse(serializePresenceDataToJson(mockData))).toEqual(mockData);
    expect(
      buildPresenceExportFileBaseName({
        brandName: "XPeng",
        regionName: "North America",
        lastUpdated: "2026-03-31",
      }),
    ).toBe("ev-presence-xpeng-north-america-2026-03-31");
    expect(
      buildPresenceExportFileBaseName({
        lastUpdated: "2026-03-31",
      }),
    ).toBe("ev-presence-all-brands-all-regions-2026-03-31");
  });
});
