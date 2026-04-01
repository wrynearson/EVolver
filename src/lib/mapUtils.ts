import type { ExpressionSpecification } from "maplibre-gl";

// Return type is loosened because MapLibre's ExpressionSpecification
// type is too strict for dynamically-built match expressions with spread.
type ColorExpression = ExpressionSpecification | string;
const TRANSPARENT_FILL = "rgba(0,0,0,0)";
const LIGHT_BLUE = "#93c5fd";
const MEDIUM_BLUE = "#3b82f6";
const DARK_BLUE = "#1d4ed8";

interface BuildColorExpressionOptions {
  selectedBrand?: string;
  uncertainCountryCodes?: Iterable<string>;
}

/**
 * Builds a MapLibre "match" expression that maps ISO_A3 country codes
 * to fill colors based on how many EV brands are present there.
 *
 * Countries with 0 brands get transparent fill.
 * 1 brand = light blue, 2-3 = medium, 4+ = dark.
 */
export function buildColorExpression(
  countryBrandCounts: Record<string, number>,
  options: BuildColorExpressionOptions = {},
): ColorExpression {
  const entries: string[] = [];
  const uncertainCountryCodes = new Set(options.uncertainCountryCodes ?? []);
  const useSelectedBrandUncertaintyColors =
    Boolean(options.selectedBrand) && uncertainCountryCodes.size > 0;

  for (const [iso, count] of Object.entries(countryBrandCounts)) {
    entries.push(
      iso,
      useSelectedBrandUncertaintyColors
        ? selectedBrandCountToColor(count, uncertainCountryCodes.has(iso))
        : countToColor(count),
    );
  }

  if (entries.length === 0) {
    return TRANSPARENT_FILL;
  }

  // ["match", ["get", "ISO_A3"], "NOR", "#color", "DEU", "#color", ..., fallback]
  return [
    "match",
    ["get", "ISO_A3"],
    ...entries,
    TRANSPARENT_FILL,
  ] as unknown as ExpressionSpecification;
}

function countToColor(count: number): string {
  if (count >= 4) return DARK_BLUE;
  if (count >= 2) return MEDIUM_BLUE;
  if (count >= 1) return LIGHT_BLUE;
  return TRANSPARENT_FILL;
}

function selectedBrandCountToColor(count: number, uncertain: boolean): string {
  if (count < 1) {
    return TRANSPARENT_FILL;
  }

  return uncertain ? LIGHT_BLUE : DARK_BLUE;
}

export interface LegendItem {
  color: string;
  label: string;
}

interface GetLegendItemsOptions {
  hasUncertainEntries?: boolean;
}

/**
 * Returns human-readable legend labels for the current map scope.
 * When a single brand is selected, the map becomes binary (present/absent),
 * so the multi-brand tier legend would be misleading.
 */
export function getLegendItems(
  selectedBrand?: string,
  options: GetLegendItemsOptions = {},
): LegendItem[] {
  if (selectedBrand) {
    if (options.hasUncertainEntries) {
      return [
        { color: DARK_BLUE, label: `${selectedBrand} confirmed` },
        { color: LIGHT_BLUE, label: `${selectedBrand} uncertain` },
      ];
    }

    return [{ color: LIGHT_BLUE, label: `${selectedBrand} present` }];
  }

  return [
    { color: LIGHT_BLUE, label: "1 brand" },
    { color: MEDIUM_BLUE, label: "2-3 brands" },
    { color: DARK_BLUE, label: "4+ brands" },
  ];
}
