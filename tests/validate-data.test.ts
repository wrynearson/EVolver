import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { EVPresenceData } from "../src/types";

/**
 * These tests validate the ev-presence.json data file.
 * They act as guardrails for the evolver agent -- the agent must
 * pass these tests before committing any changes to the data.
 */

const dataPath = resolve(__dirname, "../data/ev-presence.json");
const raw = readFileSync(dataPath, "utf-8");

describe("ev-presence.json", () => {
  let data: EVPresenceData;

  it("is valid JSON", () => {
    expect(() => {
      data = JSON.parse(raw);
    }).not.toThrow();
  });

  it("has metadata with a valid ISO date", () => {
    data = JSON.parse(raw);
    expect(data.metadata).toBeDefined();
    expect(data.metadata.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(data.metadata.last_updated))).toBe(false);
  });

  it("has schema_version", () => {
    data = JSON.parse(raw);
    expect(data.metadata.schema_version).toBe(1);
  });

  it("has at least 1 brand", () => {
    data = JSON.parse(raw);
    expect(Object.keys(data.brands).length).toBeGreaterThanOrEqual(1);
  });

  it("each brand has a website and countries object", () => {
    data = JSON.parse(raw);
    for (const [brandName, brand] of Object.entries(data.brands)) {
      expect(
        typeof brand.website,
        `${brandName} should have a website string`,
      ).toBe("string");
      expect(
        typeof brand.countries,
        `${brandName} should have a countries object`,
      ).toBe("object");
      expect(
        brand.countries,
        `${brandName}.countries should not be null`,
      ).not.toBeNull();
    }
  });

  it("each country entry has required fields with correct types", () => {
    data = JSON.parse(raw);
    for (const [brandName, brand] of Object.entries(data.brands)) {
      for (const [isoCode, entry] of Object.entries(brand.countries)) {
        const prefix = `${brandName}.${isoCode}`;

        expect(typeof entry.name, `${prefix}.name should be string`).toBe(
          "string",
        );
        expect(
          typeof entry.present,
          `${prefix}.present should be boolean`,
        ).toBe("boolean");
        expect(
          typeof entry.uncertain,
          `${prefix}.uncertain should be boolean`,
        ).toBe("boolean");
        expect(
          entry.source === null || typeof entry.source === "string",
          `${prefix}.source should be string or null`,
        ).toBe(true);
      }
    }
  });

  it("ISO_A3 keys are 3-letter uppercase strings", () => {
    data = JSON.parse(raw);
    for (const [brandName, brand] of Object.entries(data.brands)) {
      for (const isoCode of Object.keys(brand.countries)) {
        expect(
          isoCode,
          `${brandName} has invalid ISO code "${isoCode}"`,
        ).toMatch(/^[A-Z]{3}$/);
      }
    }
  });

  it("present+certain entries must have a source URL", () => {
    data = JSON.parse(raw);
    for (const [brandName, brand] of Object.entries(data.brands)) {
      for (const [isoCode, entry] of Object.entries(brand.countries)) {
        if (entry.present && !entry.uncertain) {
          expect(
            entry.source,
            `${brandName}.${isoCode} is present+certain but has no source`,
          ).not.toBeNull();
          expect(
            typeof entry.source,
            `${brandName}.${isoCode} source should be a string`,
          ).toBe("string");
        }
      }
    }
  });
});
