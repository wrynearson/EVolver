import type { ExpressionSpecification } from "maplibre-gl";

// Return type is loosened because MapLibre's ExpressionSpecification
// type is too strict for dynamically-built match expressions with spread.
type ColorExpression = ExpressionSpecification | string;

/**
 * Builds a MapLibre "match" expression that maps ISO_A3 country codes
 * to fill colors based on how many EV brands are present there.
 *
 * Countries with 0 brands get transparent fill.
 * 1 brand = light blue, 2-3 = medium, 4+ = dark.
 */
export function buildColorExpression(
  countryBrandCounts: Record<string, number>,
): ColorExpression {
  const entries: string[] = [];

  for (const [iso, count] of Object.entries(countryBrandCounts)) {
    entries.push(iso, countToColor(count));
  }

  if (entries.length === 0) {
    return "rgba(0,0,0,0)";
  }

  // ["match", ["get", "ISO_A3"], "NOR", "#color", "DEU", "#color", ..., fallback]
  return ["match", ["get", "ISO_A3"], ...entries, "rgba(0,0,0,0)"] as unknown as ExpressionSpecification;
}

function countToColor(count: number): string {
  if (count >= 4) return "#1d4ed8"; // dark blue
  if (count >= 2) return "#3b82f6"; // medium blue
  if (count >= 1) return "#93c5fd"; // light blue
  return "rgba(0,0,0,0)";
}

export interface LegendItem {
  color: string;
  label: string;
}

/**
 * Returns human-readable legend labels for the current map scope.
 * When a single brand is selected, the map becomes binary (present/absent),
 * so the multi-brand tier legend would be misleading.
 */
export function getLegendItems(selectedBrand?: string): LegendItem[] {
  if (selectedBrand) {
    return [{ color: "#93c5fd", label: `${selectedBrand} present` }];
  }

  return [
    { color: "#93c5fd", label: "1 brand" },
    { color: "#3b82f6", label: "2-3 brands" },
    { color: "#1d4ed8", label: "4+ brands" },
  ];
}
