import type { EVPresenceData } from "../types";

export interface PresenceExportRow {
  brandName: string;
  brandWebsite: string;
  isoCode: string;
  countryName: string;
  regionName: string | null;
  present: boolean;
  uncertain: boolean;
  primarySource: string | null;
  sourceUrls: string[];
}

function sanitizeFileNameSegment(value: string) {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "all";
}

function escapeCsvCell(value: string | number | boolean | null) {
  const normalizedValue =
    value === null ? "" : typeof value === "boolean" ? String(value) : String(value);

  if (!/[",\n]/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `"${normalizedValue.replaceAll('"', '""')}"`;
}

export function buildPresenceExportRows(
  data: EVPresenceData,
  countryRegionLookup: Record<string, string> = {},
): PresenceExportRow[] {
  return Object.entries(data.brands)
    .flatMap(([brandName, brand]) =>
      Object.entries(brand.countries)
        .filter(([, entry]) => entry.present)
        .map(([isoCode, entry]) => ({
          brandName,
          brandWebsite: brand.website,
          isoCode,
          countryName: entry.name || isoCode,
          regionName: countryRegionLookup[isoCode] ?? null,
          present: entry.present,
          uncertain: entry.uncertain,
          primarySource: entry.source,
          sourceUrls: Array.from(
            new Set(entry.sources ?? (entry.source ? [entry.source] : [])),
          ),
        })),
    )
    .sort((a, b) => {
      const countryComparison = a.countryName.localeCompare(b.countryName);

      if (countryComparison !== 0) {
        return countryComparison;
      }

      return a.brandName.localeCompare(b.brandName);
    });
}

export function serializePresenceDataToCsv(
  data: EVPresenceData,
  countryRegionLookup: Record<string, string> = {},
): string {
  const header = [
    "brand",
    "brand_website",
    "country_iso",
    "country_name",
    "region",
    "present",
    "uncertain",
    "primary_source",
    "source_urls",
  ];
  const rows = buildPresenceExportRows(data, countryRegionLookup);

  return [
    header.join(","),
    ...rows.map((row) =>
      [
        row.brandName,
        row.brandWebsite,
        row.isoCode,
        row.countryName,
        row.regionName,
        row.present,
        row.uncertain,
        row.primarySource,
        row.sourceUrls.join(" | "),
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ].join("\n");
}

export function serializePresenceDataToJson(data: EVPresenceData): string {
  return JSON.stringify(data, null, 2);
}

export function buildPresenceExportFileBaseName(options: {
  brandName?: string;
  regionName?: string;
  lastUpdated: string;
}) {
  const brandSegment = sanitizeFileNameSegment(options.brandName ?? "all-brands");
  const regionSegment = sanitizeFileNameSegment(options.regionName ?? "all-regions");
  const dateSegment = sanitizeFileNameSegment(options.lastUpdated);

  return `ev-presence-${brandSegment}-${regionSegment}-${dateSegment}`;
}

export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
