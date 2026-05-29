import { describe, expect, it } from "vitest";
import { getCountrySelection } from "../src/components/MapCanvas";

describe("getCountrySelection", () => {
  it("returns null when ISO_A3 is missing", () => {
    expect(getCountrySelection({ ADMIN: "Norway" })).toBeNull();
  });

  it("returns null when ISO_A3 is the Natural Earth placeholder", () => {
    expect(
      getCountrySelection({ ISO_A3: "-99", ADMIN: "Disputed territory" }),
    ).toBeNull();
  });

  it("prefers ADMIN for the selected country name", () => {
    expect(
      getCountrySelection({
        ISO_A3: "NOR",
        ADMIN: "Norway",
        NAME: "Norge",
      }),
    ).toEqual({
      isoCode: "NOR",
      countryName: "Norway",
    });
  });

  it("falls back to NAME when ADMIN is unavailable", () => {
    expect(
      getCountrySelection({
        ISO_A3: "SWE",
        NAME: "Sweden",
      }),
    ).toEqual({
      isoCode: "SWE",
      countryName: "Sweden",
    });
  });

  it("trims country names before returning them", () => {
    expect(
      getCountrySelection({
        ISO_A3: "ESP",
        ADMIN: "  Spain  ",
      }),
    ).toEqual({
      isoCode: "ESP",
      countryName: "Spain",
    });
  });

  it("returns undefined for the country name when neither label is usable", () => {
    expect(
      getCountrySelection({
        ISO_A3: "ITA",
        ADMIN: "   ",
        NAME: "",
      }),
    ).toEqual({
      isoCode: "ITA",
      countryName: undefined,
    });
  });
});
