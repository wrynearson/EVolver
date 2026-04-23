import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  filterPresenceDataToBrand,
  filterPresenceDataToRegion,
  getBrandCoverageSummaries,
  getBrandMajorRegionGapSummaries,
  getBrandRegionCoverageSummaries,
  getBrandPresenceCountries,
  getCountryRegionLookup,
  getCountryRegionBrandSuggestions,
  getCountryCoverageSummaries,
  getCountryPresenceDetails,
  getRegionCoverageSummaries,
  normalizeCoverageRegion,
  useEVData,
} from "../hooks/useEVData";
import {
  buildPresenceExportRows,
  buildPresenceExportFileBaseName,
  downloadTextFile,
  serializePresenceDataToCsv,
  serializePresenceDataToJson,
} from "../lib/dataExport";
import { buildColorExpression, getFeatureBounds, getLegendItems } from "../lib/mapUtils";
import type { FeatureCollection } from "geojson";
import type {
  BrandCoverageSummary,
  BrandMajorRegionGapSummary,
  CountryCoverageSummary,
  MapCountrySelection,
  RegionCoverageSummary,
} from "../types";

type CopyStatus = "idle" | "copied" | "failed";
type CopySourcesState = {
  key: string | null;
  status: CopyStatus;
};
type CoveragePanelView = "brands" | "countries" | "regions";
type CoverageSort = "coverage" | "name";
type FootprintSort = "name" | "name-desc" | "region" | "region-desc";
type ActiveViewFilter = {
  key: string;
  label: string;
  clearLabel: string;
  onClear: () => void;
};
type SelectionState = {
  selectedBrand: string;
  selectedCountry: MapCountrySelection | null;
  coveragePanelView: CoveragePanelView;
  coverageSearchQuery: string;
  showOnlyUncertainCoverage: boolean;
  selectedCoverageRegion: string;
  coverageSort: CoverageSort;
  showOnlyUncertainFootprint: boolean;
  footprintSort: FootprintSort;
  footprintSearchQuery: string;
};
type CountryOption = {
  isoCode: string;
  countryName: string;
  regionName?: string;
};
type CountryLookupMatch = CountryOption;
type BrandLookupMatch = string;

const MapCanvas = lazy(() => import("./MapCanvas"));
const COVERAGE_PANEL_VIEWS: CoveragePanelView[] = [
  "brands",
  "countries",
  "regions",
];
const DEFAULT_COVERAGE_SORT: CoverageSort = "coverage";
const DEFAULT_FOOTPRINT_SORT: FootprintSort = "name";
const UNCERTAIN_BADGE_TOOLTIP =
  "Official presence is tracked here, but the supporting evidence still needs direct verification or reconciliation.";

function getSourceCountLabel(sourceCount: number) {
  return `${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`;
}

function getSourceCountBadgeClassName(sourceCount: number) {
  if (sourceCount >= 3) {
    return "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
  }

  if (sourceCount === 2) {
    return "rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800";
  }

  return "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700";
}

function getSourceCountBadgeTitle(sourceCount: number) {
  return `Verified from ${sourceCount} official ${sourceCount === 1 ? "source URL" : "source URLs"}.`;
}

function isCoveragePanelView(value: string): value is CoveragePanelView {
  return value === "brands" || value === "countries" || value === "regions";
}

function isCoverageSort(value: string): value is CoverageSort {
  return value === "coverage" || value === "name";
}

function isFootprintSort(value: string): value is FootprintSort {
  return (
    value === "name" ||
    value === "name-desc" ||
    value === "region" ||
    value === "region-desc"
  );
}

function matchesSearchQuery(values: Array<string | undefined>, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) =>
    value?.toLowerCase().includes(normalizedQuery),
  );
}

function normalizeIsoCode(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalizedValue) ? normalizedValue : null;
}

function getCountryLookupValue(country: MapCountrySelection | null) {
  if (!country) {
    return "";
  }

  return country.countryName ?? country.isoCode;
}

function getCopySourcesButtonLabel(
  copySourcesState: CopySourcesState,
  targetKey: string,
) {
  if (copySourcesState.key !== targetKey) {
    return "Copy sources";
  }

  return copySourcesState.status === "copied"
    ? "Copied sources"
    : copySourcesState.status === "failed"
      ? "Sources copy failed"
      : "Copy sources";
}

function getCopyAllSourcesButtonLabel(
  copySourcesState: CopySourcesState,
  targetKey: string,
  idleLabel = "Copy all sources",
) {
  if (copySourcesState.key !== targetKey) {
    return idleLabel;
  }

  return copySourcesState.status === "copied"
    ? idleLabel.replace("Copy", "Copied")
    : copySourcesState.status === "failed"
      ? `${idleLabel.replace("Copy", "").trim()} copy failed`
      : idleLabel;
}

function getCopyCoverageButtonLabel(
  view: CoveragePanelView,
  status: CopyStatus,
) {
  const idleLabel =
    view === "brands"
      ? "Copy visible brands"
      : view === "countries"
        ? "Copy visible countries"
        : "Copy visible regions";

  return status === "copied"
    ? idleLabel.replace("Copy", "Copied")
    : status === "failed"
      ? `${idleLabel.replace("Copy", "").trim()} copy failed`
      : idleLabel;
}

function formatBrandPresenceMarketList(
  countries: Array<{
    isoCode: string;
    countryName: string;
    regionName?: string;
    uncertain: boolean;
  }>,
) {
  return countries.map((country) => {
    const detailParts = [country.isoCode];

    if (country.regionName) {
      detailParts.push(country.regionName);
    }

    if (country.uncertain) {
      detailParts.push("uncertain");
    }

    return `${country.countryName} (${detailParts.join(" - ")})`;
  });
}

function formatBrandCoverageList(summaries: BrandCoverageSummary[]) {
  return summaries.map((brand) => {
    const detailParts = [
      `${brand.confirmedCountryCount} confirmed ${
        brand.confirmedCountryCount === 1 ? "market" : "markets"
      }`,
    ];

    if (brand.uncertainCountryCount > 0) {
      detailParts.push(
        `${brand.uncertainCountryCount} uncertain ${
          brand.uncertainCountryCount === 1 ? "market" : "markets"
        }`,
      );
    }

    return `${brand.brandName} (${detailParts.join(" - ")})`;
  });
}

function formatCountryCoverageList(
  summaries: CountryCoverageSummary[],
  countryRegionLookup: Record<string, string>,
) {
  return summaries.map((country) => {
    const detailParts = [country.isoCode];
    const regionName = countryRegionLookup[country.isoCode];

    if (regionName) {
      detailParts.push(regionName);
    }

    detailParts.push(
      `${country.confirmedBrandCount} confirmed ${
        country.confirmedBrandCount === 1 ? "brand" : "brands"
      }`,
    );

    if (country.uncertainBrandCount > 0) {
      detailParts.push(
        `${country.uncertainBrandCount} uncertain ${
          country.uncertainBrandCount === 1 ? "brand" : "brands"
        }`,
      );
    }

    const activeBrands = country.brandNames.join(", ");

    return activeBrands
      ? `${country.countryName} (${detailParts.join(" - ")}) — ${activeBrands}`
      : `${country.countryName} (${detailParts.join(" - ")})`;
  });
}

function formatRegionCoverageList(summaries: RegionCoverageSummary[]) {
  return summaries.map((region) => {
    const detailParts = [
      `${region.confirmedCountryCount} confirmed ${
        region.confirmedCountryCount === 1 ? "country" : "countries"
      }`,
      `${region.brandNames.length} tracked ${
        region.brandNames.length === 1 ? "brand" : "brands"
      }`,
    ];

    if (region.uncertainCountryCount > 0) {
      detailParts.push(
        `${region.uncertainCountryCount} uncertain ${
          region.uncertainCountryCount === 1 ? "country" : "countries"
        }`,
      );
    }

    const activeBrands = region.brandNames.join(", ");

    return activeBrands
      ? `${region.regionName} (${detailParts.join(" - ")}) — ${activeBrands}`
      : `${region.regionName} (${detailParts.join(" - ")})`;
  });
}

function formatMajorRegionGapList(summaries: BrandMajorRegionGapSummary[]) {
  return summaries.map((summary) => {
    const confirmedMarketLabel =
      summary.confirmedCountryCount === 1 ? "market" : "markets";

    return `${summary.brandName} (${summary.confirmedCountryCount} confirmed ${confirmedMarketLabel} - ${summary.coveredMajorRegionCount}/4 major regions covered) — missing ${summary.missingRegions.join(", ")}`;
  });
}

function filterCountriesToRegion(
  countries: FeatureCollection | null,
  regionName?: string,
): FeatureCollection | null {
  if (!countries || !regionName) {
    return countries;
  }

  return {
    ...countries,
    features: countries.features.filter((feature) => {
      const properties = feature.properties;

      return (
        normalizeCoverageRegion(
          typeof properties?.REGION_UN === "string"
            ? properties.REGION_UN
            : typeof properties?.CONTINENT === "string"
              ? properties.CONTINENT
              : null,
        ) === regionName
      );
    }),
  };
}

function findCountryLookupMatch(
  countryOptions: CountryOption[],
  query: string,
): CountryLookupMatch | null {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  return (
    countryOptions.find(
      (country) =>
        country.countryName.toLowerCase() === normalizedQuery ||
        country.isoCode.toLowerCase() === normalizedQuery,
    ) ?? null
  );
}

function findBrandLookupMatch(
  brandOptions: string[],
  query: string,
): BrandLookupMatch | null {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return null;
  }

  return (
    brandOptions.find((brandName) => brandName.toLowerCase() === normalizedQuery) ??
    null
  );
}

function getNextCoveragePanelView(
  currentView: CoveragePanelView,
  key: string,
): CoveragePanelView | null {
  const currentIndex = COVERAGE_PANEL_VIEWS.indexOf(currentView);

  if (currentIndex === -1) {
    return null;
  }

  if (key === "ArrowRight") {
    return COVERAGE_PANEL_VIEWS[(currentIndex + 1) % COVERAGE_PANEL_VIEWS.length];
  }

  if (key === "ArrowLeft") {
    return (
      COVERAGE_PANEL_VIEWS[
        (currentIndex - 1 + COVERAGE_PANEL_VIEWS.length) %
          COVERAGE_PANEL_VIEWS.length
      ]
    );
  }

  if (key === "Home") {
    return COVERAGE_PANEL_VIEWS[0];
  }

  if (key === "End") {
    return COVERAGE_PANEL_VIEWS[COVERAGE_PANEL_VIEWS.length - 1];
  }

  return null;
}

function getCoverageFilterToggleLabel(view: CoveragePanelView) {
  return view === "brands"
    ? "Show only brands with uncertain presence"
    : view === "countries"
      ? "Show only countries with uncertain presence"
      : "Show only regions with uncertain presence";
}

function getCoveragePanelViewLabel(view: CoveragePanelView) {
  return view === "brands"
    ? "Brands"
    : view === "countries"
      ? "Countries"
      : "Regions";
}

function getCoverageEmptyStateMessage(
  view: CoveragePanelView,
  showOnlyUncertainCoverage: boolean,
  hasCoverageSearchQuery: boolean,
) {
  if (!showOnlyUncertainCoverage) {
    return view === "brands"
      ? "No brands match this filter."
      : view === "countries"
        ? "No countries match this filter."
        : "No regions match this filter.";
  }

  if (hasCoverageSearchQuery) {
    return view === "brands"
      ? "No uncertain brands match this filter."
      : view === "countries"
        ? "No uncertain countries match this filter."
        : "No uncertain regions match this filter.";
  }

  return view === "brands"
    ? "No brands with uncertain presence in this view."
    : view === "countries"
      ? "No countries with uncertain presence in this view."
      : "No regions with uncertain presence in this view.";
}

function getFootprintEmptyStateMessage(
  showOnlyUncertainFootprint: boolean,
  hasFootprintSearchQuery: boolean,
) {
  if (!showOnlyUncertainFootprint) {
    return "No markets match this filter.";
  }

  return hasFootprintSearchQuery
    ? "No uncertain markets match this filter."
    : "No uncertain markets in this footprint.";
}

function getNextLookupIndex(
  currentIndex: number,
  optionCount: number,
  key: string,
) {
  if (optionCount === 0) {
    return -1;
  }

  if (key === "ArrowDown") {
    return currentIndex < optionCount - 1 ? currentIndex + 1 : 0;
  }

  if (key === "ArrowUp") {
    return currentIndex > 0 ? currentIndex - 1 : optionCount - 1;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return optionCount - 1;
  }

  return currentIndex;
}

function compareFootprintCountries(
  a: CountryOption & { regionName?: string; isoCode: string; countryName: string },
  b: CountryOption & { regionName?: string; isoCode: string; countryName: string },
  sort: FootprintSort,
) {
  const regionNameA = a.regionName ?? "";
  const regionNameB = b.regionName ?? "";
  const regionComparison = regionNameA.localeCompare(regionNameB);
  const countryNameComparison = a.countryName.localeCompare(b.countryName);

  if (sort === "region" || sort === "region-desc") {
    if (regionComparison !== 0) {
      return sort === "region-desc" ? -regionComparison : regionComparison;
    }

    if (countryNameComparison !== 0) {
      return countryNameComparison;
    }

    return a.isoCode.localeCompare(b.isoCode);
  }

  if (sort === "name-desc") {
    if (countryNameComparison !== 0) {
      return -countryNameComparison;
    }

    return b.isoCode.localeCompare(a.isoCode);
  }

  if (countryNameComparison !== 0) {
    return countryNameComparison;
  }

  return a.isoCode.localeCompare(b.isoCode);
}

function getSelectionStateFromSearch(search: string): SelectionState {
  const searchParams = new URLSearchParams(search);
  const selectedBrand = searchParams.get("brand")?.trim() ?? "";
  const selectedCountryIsoCode = normalizeIsoCode(searchParams.get("country"));
  const requestedCoveragePanelView = searchParams.get("view")?.trim() ?? "";
  const coverageSearchQuery = searchParams.get("coverageQuery")?.trim() ?? "";
  const showOnlyUncertainCoverage =
    searchParams.get("uncertainOnly")?.trim() === "true";
  const selectedCoverageRegion = searchParams.get("region")?.trim() ?? "";
  const requestedCoverageSort = searchParams.get("coverageSort")?.trim() ?? "";
  const showOnlyUncertainFootprint =
    searchParams.get("footprintUncertainOnly")?.trim() === "true";
  const requestedFootprintSort = searchParams.get("footprintSort")?.trim() ?? "";
  const footprintSearchQuery = searchParams.get("footprintQuery")?.trim() ?? "";
  const coveragePanelView = isCoveragePanelView(requestedCoveragePanelView)
    ? requestedCoveragePanelView
    : selectedCoverageRegion
      ? "countries"
      : "brands";

  return {
    selectedBrand,
    selectedCountry: selectedCountryIsoCode
      ? { isoCode: selectedCountryIsoCode }
      : null,
    coveragePanelView,
    coverageSearchQuery,
    showOnlyUncertainCoverage,
    selectedCoverageRegion,
    coverageSort: isCoverageSort(requestedCoverageSort)
      ? requestedCoverageSort
      : DEFAULT_COVERAGE_SORT,
    showOnlyUncertainFootprint,
    footprintSort: isFootprintSort(requestedFootprintSort)
      ? requestedFootprintSort
      : DEFAULT_FOOTPRINT_SORT,
    footprintSearchQuery,
  };
}

function getInitialSelectionState(): SelectionState {
  if (typeof window === "undefined") {
    return {
      selectedBrand: "",
      selectedCountry: null,
      coveragePanelView: "brands",
      coverageSearchQuery: "",
      showOnlyUncertainCoverage: false,
      selectedCoverageRegion: "",
      coverageSort: DEFAULT_COVERAGE_SORT,
      showOnlyUncertainFootprint: false,
      footprintSort: DEFAULT_FOOTPRINT_SORT,
      footprintSearchQuery: "",
    };
  }

  return getSelectionStateFromSearch(window.location.search);
}

function buildShareUrl(
  selectedBrand: string,
  selectedCountry: MapCountrySelection | null,
  coveragePanelView: CoveragePanelView,
  coverageSearchQuery: string,
  showOnlyUncertainCoverage: boolean,
  selectedCoverageRegion: string,
  coverageSort: CoverageSort,
  showOnlyUncertainFootprint: boolean,
  footprintSort: FootprintSort,
  footprintSearchQuery: string,
) {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);

  if (selectedBrand) {
    url.searchParams.set("brand", selectedBrand);
  } else {
    url.searchParams.delete("brand");
  }

  if (selectedCountry?.isoCode) {
    url.searchParams.set("country", selectedCountry.isoCode);
  } else {
    url.searchParams.delete("country");
  }

  if (coveragePanelView !== "brands" || selectedCoverageRegion) {
    url.searchParams.set("view", coveragePanelView);
  } else {
    url.searchParams.delete("view");
  }

  if (selectedCoverageRegion) {
    url.searchParams.set("region", selectedCoverageRegion);
  } else {
    url.searchParams.delete("region");
  }

  if (coverageSearchQuery.trim()) {
    url.searchParams.set("coverageQuery", coverageSearchQuery.trim());
  } else {
    url.searchParams.delete("coverageQuery");
  }

  if (showOnlyUncertainCoverage) {
    url.searchParams.set("uncertainOnly", "true");
  } else {
    url.searchParams.delete("uncertainOnly");
  }

  if (coverageSort !== DEFAULT_COVERAGE_SORT) {
    url.searchParams.set("coverageSort", coverageSort);
  } else {
    url.searchParams.delete("coverageSort");
  }

  if (showOnlyUncertainFootprint) {
    url.searchParams.set("footprintUncertainOnly", "true");
  } else {
    url.searchParams.delete("footprintUncertainOnly");
  }

  if (footprintSort !== DEFAULT_FOOTPRINT_SORT) {
    url.searchParams.set("footprintSort", footprintSort);
  } else {
    url.searchParams.delete("footprintSort");
  }

  if (footprintSearchQuery.trim()) {
    url.searchParams.set("footprintQuery", footprintSearchQuery.trim());
  } else {
    url.searchParams.delete("footprintQuery");
  }

  return url.toString();
}

/**
 * Main map component. Renders a full-viewport MapLibre map with:
 * - OpenFreeMap tiles as the basemap
 * - Natural Earth country polygons colored by number of Chinese EV brands present
 * - A simple legend overlay
 *
 * This is the minimal viable map — the EVolver agent adds interactivity
 * (popups, sidebar, brand selector, etc.) over its daily evolution runs.
 */
export default function EVMap() {
  const { data, countryBrandCount, summary, loading, error } = useEVData();
  const initialSelectionState = getInitialSelectionState();
  const brandFilterInputRef = useRef<HTMLInputElement | null>(null);
  const coverageTabRefs = useRef<Record<CoveragePanelView, HTMLButtonElement | null>>({
    brands: null,
    countries: null,
    regions: null,
  });
  const hasInitializedCopyLinkReset = useRef(false);
  const hasInitializedCopyCountryReset = useRef(false);
  const hasInitializedCopyBrandWebsiteReset = useRef(false);
  const hasInitializedCopyBrandMarketsReset = useRef(false);
  const hasInitializedCopyCoverageReset = useRef(false);
  const hasInitializedCopyMajorRegionGapsReset = useRef(false);
  const hasInitializedCopySourcesReset = useRef(false);
  const hasInitializedCoverageSearchReset = useRef(false);
  const hasInitializedFootprintSearchReset = useRef(false);
  const skipNextCoverageSearchReset = useRef(false);
  const skipNextFootprintSearchReset = useRef(false);
  const [countries, setCountries] = useState<FeatureCollection | null>(null);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    () => initialSelectionState.selectedBrand,
  );
  const [hoveredCountry, setHoveredCountry] = useState<MapCountrySelection | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<MapCountrySelection | null>(
    () => initialSelectionState.selectedCountry,
  );
  const [copyLinkStatus, setCopyLinkStatus] = useState<CopyStatus>("idle");
  const [copyCountryStatus, setCopyCountryStatus] = useState<CopyStatus>("idle");
  const [copyBrandWebsiteStatus, setCopyBrandWebsiteStatus] = useState<CopyStatus>("idle");
  const [copyBrandMarketsStatus, setCopyBrandMarketsStatus] = useState<CopyStatus>("idle");
  const [copyCoverageStatus, setCopyCoverageStatus] = useState<CopyStatus>("idle");
  const [copyMajorRegionGapsStatus, setCopyMajorRegionGapsStatus] =
    useState<CopyStatus>("idle");
  const [copySourcesState, setCopySourcesState] = useState<CopySourcesState>({
    key: null,
    status: "idle",
  });
  const [coveragePanelView, setCoveragePanelView] = useState<CoveragePanelView>(
    () => initialSelectionState.coveragePanelView,
  );
  const [coverageSearchQuery, setCoverageSearchQuery] = useState(
    () => initialSelectionState.coverageSearchQuery,
  );
  const [showOnlyUncertainCoverage, setShowOnlyUncertainCoverage] = useState(
    () => initialSelectionState.showOnlyUncertainCoverage,
  );
  const [selectedCoverageRegion, setSelectedCoverageRegion] = useState(
    () => initialSelectionState.selectedCoverageRegion,
  );
  const [coverageSort, setCoverageSort] = useState<CoverageSort>(
    () => initialSelectionState.coverageSort,
  );
  const [selectedMajorRegionGap, setSelectedMajorRegionGap] = useState<{
    brandName: string;
    regionName: string;
  } | null>(null);
  const [showOnlyUncertainFootprint, setShowOnlyUncertainFootprint] = useState(
    () => initialSelectionState.showOnlyUncertainFootprint,
  );
  const [footprintSort, setFootprintSort] = useState<FootprintSort>(
    () => initialSelectionState.footprintSort,
  );
  const [footprintSearchQuery, setFootprintSearchQuery] = useState(
    () => initialSelectionState.footprintSearchQuery,
  );
  const [countryLookupQuery, setCountryLookupQuery] = useState(() =>
    getCountryLookupValue(initialSelectionState.selectedCountry),
  );
  const [brandLookupQuery, setBrandLookupQuery] = useState(
    () => initialSelectionState.selectedBrand,
  );
  const [activeCountryLookupIndex, setActiveCountryLookupIndex] = useState(-1);
  const [activeBrandLookupIndex, setActiveBrandLookupIndex] = useState(-1);
  const activeSelectedBrand =
    data && selectedBrand && !data.brands[selectedBrand] ? "" : selectedBrand;
  const applyBrandSelection = (brandName: string) => {
    setSelectedBrand(brandName);
    setBrandLookupQuery(brandName);
    setSelectedMajorRegionGap((current) =>
      current?.brandName === brandName ? current : null,
    );
  };
  const clearBrandSelection = () => {
    setSelectedBrand("");
    setBrandLookupQuery("");
    setSelectedMajorRegionGap(null);
  };
  const clearCoverageRegion = () => {
    setSelectedCoverageRegion("");
  };
  const clearSelectedCountry = () => {
    setCountryLookupQuery("");
    setSelectedCountry(null);
  };
  const focusBrandMajorRegionGap = (brandName: string, regionName: string) => {
    applyBrandSelection(brandName);
    clearSelectedCountry();
    setSelectedMajorRegionGap({ brandName, regionName });
  };
  const clearCoverageSearch = () => {
    setCoverageSearchQuery("");
  };
  const clearFootprintSearch = () => {
    setFootprintSearchQuery("");
  };
  const clearFootprintUncertainFilter = () => {
    setShowOnlyUncertainFootprint(false);
  };
  const clearMajorRegionGap = () => {
    setSelectedMajorRegionGap(null);
  };
  const resetView = () => {
    clearBrandSelection();
    setHoveredCountry(null);
    setSelectedCountry(null);
    setCoveragePanelView("brands");
    setSelectedCoverageRegion("");
    setCoverageSort(DEFAULT_COVERAGE_SORT);
    setShowOnlyUncertainCoverage(false);
    setShowOnlyUncertainFootprint(false);
    setFootprintSort(DEFAULT_FOOTPRINT_SORT);
    setCoverageSearchQuery("");
    setFootprintSearchQuery("");
    setCountryLookupQuery("");
    setCopyLinkStatus("idle");
    setCopyCountryStatus("idle");
    setCopyBrandWebsiteStatus("idle");
    setCopyBrandMarketsStatus("idle");
    setCopySourcesState({ key: null, status: "idle" });
  };

  const brandOptions = useMemo(
    () => (data ? Object.keys(data.brands).sort((a, b) => a.localeCompare(b)) : []),
    [data],
  );
  const countryRegionLookup = useMemo(
    () => (countries ? getCountryRegionLookup(countries) : {}),
    [countries],
  );
  const availableRegions = useMemo(
    () =>
      Array.from(new Set(Object.values(countryRegionLookup))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [countryRegionLookup],
  );
  const visibleCountries = useMemo(
    () => filterCountriesToRegion(countries, selectedCoverageRegion || undefined),
    [countries, selectedCoverageRegion],
  );
  const regionScopedData = useMemo(() => {
    if (!data || !countries || !selectedCoverageRegion) {
      return data;
    }

    return filterPresenceDataToRegion(
      data,
      countryRegionLookup,
      selectedCoverageRegion,
    );
  }, [countries, countryRegionLookup, data, selectedCoverageRegion]);

  const visibleCountryBrandCount = useMemo(() => {
    if (!regionScopedData) {
      return countryBrandCount;
    }

    return computeCountryBrandCounts(
      regionScopedData,
      activeSelectedBrand || undefined,
    );
  }, [activeSelectedBrand, countryBrandCount, regionScopedData]);

  const visibleSummary = useMemo(() => {
    if (!regionScopedData) {
      return summary;
    }

    return computeDatasetSummary(
      regionScopedData,
      activeSelectedBrand || undefined,
    );
  }, [activeSelectedBrand, regionScopedData, summary]);
  const brandLookupCoverageSummaries = useMemo(
    () => (regionScopedData ? getBrandCoverageSummaries(regionScopedData) : []),
    [regionScopedData],
  );
  const brandLookupCoverageSummaryByName = useMemo(
    () =>
      new Map(
        brandLookupCoverageSummaries.map((summary) => [summary.brandName, summary]),
      ),
    [brandLookupCoverageSummaries],
  );
  const exportData = useMemo(() => {
    if (!regionScopedData) {
      return null;
    }

    return filterPresenceDataToBrand(regionScopedData, activeSelectedBrand || undefined);
  }, [activeSelectedBrand, regionScopedData]);
  const exportFileBaseName = useMemo(
    () =>
      buildPresenceExportFileBaseName({
        brandName: activeSelectedBrand || undefined,
        regionName: selectedCoverageRegion || undefined,
        lastUpdated:
          visibleSummary?.lastUpdated ?? data?.metadata.last_updated ?? "unknown-date",
      }),
    [activeSelectedBrand, data, selectedCoverageRegion, visibleSummary],
  );
  const exportSourceUrls = useMemo(() => {
    if (!exportData) {
      return [];
    }

    return Array.from(
      new Set(
        buildPresenceExportRows(exportData, countryRegionLookup).flatMap(
          (row) => row.sourceUrls,
        ),
      ),
    );
  }, [countryRegionLookup, exportData]);

  const countryOptions = useMemo<CountryOption[]>(() => {
    if (!visibleCountries) {
      return [];
    }

    return visibleCountries.features
      .flatMap((feature) => {
        const properties = feature.properties;
        const isoCode =
          typeof properties?.ISO_A3 === "string" ? properties.ISO_A3 : null;

        if (!isoCode || isoCode === "-99") {
          return [];
        }

        const countryName =
          typeof properties?.ADMIN === "string"
            ? properties.ADMIN
            : typeof properties?.NAME === "string"
              ? properties.NAME
              : isoCode;
        const regionName = normalizeCoverageRegion(
          typeof properties?.REGION_UN === "string"
            ? properties.REGION_UN
            : typeof properties?.CONTINENT === "string"
              ? properties.CONTINENT
              : null,
        );

        return [{ isoCode, countryName, regionName: regionName ?? undefined }];
      })
      .sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, [visibleCountries]);

  const resolvedSelectedCountry = useMemo(() => {
    const resolveCountrySelection = (country: MapCountrySelection | null) => {
      if (!country) {
        return null;
      }

      const matchingCountry = countryOptions.find(
        (option) => option.isoCode === country.isoCode,
      );

      if (!matchingCountry) {
        return country;
      }

      return {
        isoCode: matchingCountry.isoCode,
        countryName: matchingCountry.countryName,
      };
    };

    return resolveCountrySelection(selectedCountry);
  }, [countryOptions, selectedCountry]);

  const resolvedHoveredCountry = useMemo(() => {
    if (!hoveredCountry) {
      return null;
    }

    const matchingCountry = countryOptions.find(
      (country) => country.isoCode === hoveredCountry.isoCode,
    );

    if (!matchingCountry) {
      return hoveredCountry;
    }

    return {
      isoCode: matchingCountry.isoCode,
      countryName: matchingCountry.countryName,
    };
  }, [countryOptions, hoveredCountry]);

  const exactCountryLookupMatch = useMemo(
    () => findCountryLookupMatch(countryOptions, countryLookupQuery),
    [countryLookupQuery, countryOptions],
  );
  const exactBrandLookupMatch = useMemo(
    () => findBrandLookupMatch(brandOptions, brandLookupQuery),
    [brandLookupQuery, brandOptions],
  );

  const filteredCountryOptions = useMemo(() => {
    const normalizedQuery = countryLookupQuery.trim();

    if (!normalizedQuery) {
      return [];
    }

    return countryOptions
      .filter((country) =>
        matchesSearchQuery(
          [country.countryName, country.isoCode, country.regionName],
          normalizedQuery,
        ),
      )
      .slice(0, 8);
  }, [countryLookupQuery, countryOptions]);
  const filteredBrandOptions = useMemo(() => {
    const normalizedQuery = brandLookupQuery.trim();

    if (!normalizedQuery) {
      return [];
    }

    return brandOptions
      .filter((brandName) => matchesSearchQuery([brandName], normalizedQuery))
      .slice(0, 8);
  }, [brandLookupQuery, brandOptions]);

  const shouldShowCountryLookupMatches =
    countryLookupQuery.trim().length > 0 &&
    (!exactCountryLookupMatch ||
      exactCountryLookupMatch.isoCode !== resolvedSelectedCountry?.isoCode);
  const shouldShowBrandLookupMatches =
    brandLookupQuery.trim().length > 0 &&
    (!exactBrandLookupMatch || exactBrandLookupMatch !== activeSelectedBrand);

  const selectedCountryDetails = useMemo(() => {
    if (!regionScopedData || !resolvedSelectedCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        regionScopedData,
        resolvedSelectedCountry.isoCode,
        activeSelectedBrand || undefined,
        resolvedSelectedCountry.countryName,
      ) ?? {
        isoCode: resolvedSelectedCountry.isoCode,
        countryName:
          resolvedSelectedCountry.countryName ?? resolvedSelectedCountry.isoCode,
        brands: [],
      }
    );
  }, [activeSelectedBrand, regionScopedData, resolvedSelectedCountry]);

  const allSelectedCountryDetails = useMemo(() => {
    if (!regionScopedData || !resolvedSelectedCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        regionScopedData,
        resolvedSelectedCountry.isoCode,
        undefined,
        resolvedSelectedCountry.countryName,
      ) ?? {
        isoCode: resolvedSelectedCountry.isoCode,
        countryName:
          resolvedSelectedCountry.countryName ?? resolvedSelectedCountry.isoCode,
        brands: [],
      }
    );
  }, [regionScopedData, resolvedSelectedCountry]);
  const selectedCountryRegionSuggestions = useMemo(() => {
    if (!regionScopedData || !resolvedSelectedCountry) {
      return null;
    }

    return getCountryRegionBrandSuggestions(
      regionScopedData,
      resolvedSelectedCountry.isoCode,
      countryRegionLookup,
    );
  }, [countryRegionLookup, regionScopedData, resolvedSelectedCountry]);

  const hoveredCountryDetails = useMemo(() => {
    if (!regionScopedData || !resolvedHoveredCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        regionScopedData,
        resolvedHoveredCountry.isoCode,
        activeSelectedBrand || undefined,
        resolvedHoveredCountry.countryName,
      ) ?? {
        isoCode: resolvedHoveredCountry.isoCode,
        countryName: resolvedHoveredCountry.countryName ?? resolvedHoveredCountry.isoCode,
        brands: [],
      }
    );
  }, [activeSelectedBrand, regionScopedData, resolvedHoveredCountry]);

  const allHoveredCountryDetails = useMemo(() => {
    if (!regionScopedData || !resolvedHoveredCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        regionScopedData,
        resolvedHoveredCountry.isoCode,
        undefined,
        resolvedHoveredCountry.countryName,
      ) ?? {
        isoCode: resolvedHoveredCountry.isoCode,
        countryName:
          resolvedHoveredCountry.countryName ?? resolvedHoveredCountry.isoCode,
        brands: [],
      }
    );
  }, [regionScopedData, resolvedHoveredCountry]);
  const selectedCountryAllSources = useMemo(() => {
    if (!selectedCountryDetails) {
      return [];
    }

    return Array.from(
      new Set(selectedCountryDetails.brands.flatMap((brand) => brand.sources)),
    );
  }, [selectedCountryDetails]);

  const selectedBrandPresence = useMemo(() => {
    if (!regionScopedData || !activeSelectedBrand) {
      return [];
    }

    return getBrandPresenceCountries(regionScopedData, activeSelectedBrand).map(
      (country) => ({
        ...country,
        regionName: countryRegionLookup[country.isoCode],
      }),
    );
  }, [activeSelectedBrand, countryRegionLookup, regionScopedData]);
  const selectedBrandWebsite = useMemo(() => {
    if (!data || !activeSelectedBrand) {
      return "";
    }

    return data.brands[activeSelectedBrand]?.website ?? "";
  }, [activeSelectedBrand, data]);
  const selectedBrandUncertainCountryCodes = useMemo(
    () =>
      new Set(
        selectedBrandPresence
          .filter((country) => country.uncertain)
          .map((country) => country.isoCode),
      ),
    [selectedBrandPresence],
  );
  const selectedBrandRegionCoverageSummaries = useMemo(() => {
    if (!data || !activeSelectedBrand) {
      return [];
    }

    return getBrandRegionCoverageSummaries(
      data,
      activeSelectedBrand,
      countryRegionLookup,
    );
  }, [activeSelectedBrand, countryRegionLookup, data]);
  const selectedBrandTotalCountryCount = useMemo(
    () =>
      selectedBrandRegionCoverageSummaries.reduce(
        (total, region) =>
          total + region.confirmedCountryCount + region.uncertainCountryCount,
        0,
      ),
    [selectedBrandRegionCoverageSummaries],
  );
  const selectedBrandHasUncertainPresence =
    selectedBrandUncertainCountryCodes.size > 0;
  const activeMajorRegionGap =
    activeSelectedBrand && selectedMajorRegionGap?.brandName === activeSelectedBrand
      ? selectedMajorRegionGap.regionName
      : "";

  const filteredSelectedBrandPresence = useMemo(
    () =>
      selectedBrandPresence.filter(
        (country) =>
          (!showOnlyUncertainFootprint || country.uncertain) &&
          matchesSearchQuery(
            [country.countryName, country.isoCode, country.regionName],
            footprintSearchQuery,
          ),
      ),
    [footprintSearchQuery, selectedBrandPresence, showOnlyUncertainFootprint],
  );
  const sortedSelectedBrandPresence = useMemo(() => {
    return [...filteredSelectedBrandPresence].sort((a, b) =>
      compareFootprintCountries(a, b, footprintSort),
    );
  }, [filteredSelectedBrandPresence, footprintSort]);
  const selectedBrandMarketList = useMemo(
    () => formatBrandPresenceMarketList(sortedSelectedBrandPresence),
    [sortedSelectedBrandPresence],
  );
  const majorRegionGapSummaries = useMemo(() => {
    if (!data) {
      return [];
    }

    const summaries = getBrandMajorRegionGapSummaries(data);

    if (activeSelectedBrand) {
      return summaries.filter((summary) => summary.brandName === activeSelectedBrand);
    }

    return summaries.slice(0, 5);
  }, [activeSelectedBrand, data]);
  const majorRegionGapCopyList = useMemo(
    () => formatMajorRegionGapList(majorRegionGapSummaries),
    [majorRegionGapSummaries],
  );

  const brandCoverageSummaries = useMemo(() => {
    if (!regionScopedData || activeSelectedBrand) {
      return [];
    }

    return getBrandCoverageSummaries(regionScopedData).filter(
      (brand) =>
        brand.confirmedCountryCount > 0 || brand.uncertainCountryCount > 0,
    );
  }, [activeSelectedBrand, regionScopedData]);

  const countryCoverageSummaries = useMemo(() => {
    if (!regionScopedData || activeSelectedBrand) {
      return [];
    }

    return getCountryCoverageSummaries(regionScopedData);
  }, [activeSelectedBrand, regionScopedData]);

  const regionCoverageSummaries = useMemo(() => {
    if (!regionScopedData || activeSelectedBrand) {
      return [];
    }

    return getRegionCoverageSummaries(regionScopedData, countryRegionLookup);
  }, [activeSelectedBrand, countryRegionLookup, regionScopedData]);

  const visibleCountryCoverageSummaries = useMemo(
    () =>
      countryCoverageSummaries.filter(
        (country) =>
          !selectedCoverageRegion ||
          countryRegionLookup[country.isoCode] === selectedCoverageRegion,
      ),
    [countryCoverageSummaries, countryRegionLookup, selectedCoverageRegion],
  );
  const visibleBrandCoverageSummaries = useMemo(
    () =>
      brandCoverageSummaries.filter(
        (brand) => !showOnlyUncertainCoverage || brand.uncertainCountryCount > 0,
      ),
    [brandCoverageSummaries, showOnlyUncertainCoverage],
  );
  const visibleUncertainCountryCoverageSummaries = useMemo(
    () =>
      visibleCountryCoverageSummaries.filter(
        (country) => !showOnlyUncertainCoverage || country.uncertainBrandCount > 0,
      ),
    [showOnlyUncertainCoverage, visibleCountryCoverageSummaries],
  );
  const visibleUncertainRegionCoverageSummaries = useMemo(
    () =>
      regionCoverageSummaries.filter(
        (region) => !showOnlyUncertainCoverage || region.uncertainCountryCount > 0,
      ),
    [regionCoverageSummaries, showOnlyUncertainCoverage],
  );

  const filteredBrandCoverageSummaries = useMemo(
    () =>
      visibleBrandCoverageSummaries.filter((brand) =>
        matchesSearchQuery([brand.brandName], coverageSearchQuery),
      ),
    [coverageSearchQuery, visibleBrandCoverageSummaries],
  );
  const sortedBrandCoverageSummaries = useMemo(() => {
    return [...filteredBrandCoverageSummaries].sort((a, b) => {
      if (coverageSort === "name") {
        return a.brandName.localeCompare(b.brandName);
      }

      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (a.uncertainCountryCount !== b.uncertainCountryCount) {
        return a.uncertainCountryCount - b.uncertainCountryCount;
      }

      return a.brandName.localeCompare(b.brandName);
    });
  }, [coverageSort, filteredBrandCoverageSummaries]);

  const filteredCountryCoverageSummaries = useMemo(
    () =>
      visibleUncertainCountryCoverageSummaries.filter((country) =>
        matchesSearchQuery(
          [
            country.countryName,
            country.isoCode,
            countryRegionLookup[country.isoCode],
            country.brandNames.join(" "),
          ],
          coverageSearchQuery,
        ),
      ),
    [
      coverageSearchQuery,
      countryRegionLookup,
      visibleUncertainCountryCoverageSummaries,
    ],
  );
  const sortedCountryCoverageSummaries = useMemo(() => {
    return [...filteredCountryCoverageSummaries].sort((a, b) => {
      if (coverageSort === "name") {
        return a.countryName.localeCompare(b.countryName);
      }

      if (b.confirmedBrandCount !== a.confirmedBrandCount) {
        return b.confirmedBrandCount - a.confirmedBrandCount;
      }

      if (b.uncertainBrandCount !== a.uncertainBrandCount) {
        return b.uncertainBrandCount - a.uncertainBrandCount;
      }

      return a.countryName.localeCompare(b.countryName);
    });
  }, [coverageSort, filteredCountryCoverageSummaries]);

  const filteredRegionCoverageSummaries = useMemo(
    () =>
      visibleUncertainRegionCoverageSummaries.filter((region) =>
        matchesSearchQuery(
          [region.regionName, region.brandNames.join(" ")],
          coverageSearchQuery,
        ),
      ),
    [coverageSearchQuery, visibleUncertainRegionCoverageSummaries],
  );
  const sortedRegionCoverageSummaries = useMemo(() => {
    return [...filteredRegionCoverageSummaries].sort((a, b) => {
      if (coverageSort === "name") {
        return a.regionName.localeCompare(b.regionName);
      }

      if (b.confirmedCountryCount !== a.confirmedCountryCount) {
        return b.confirmedCountryCount - a.confirmedCountryCount;
      }

      if (b.brandNames.length !== a.brandNames.length) {
        return b.brandNames.length - a.brandNames.length;
      }

      if (b.uncertainCountryCount !== a.uncertainCountryCount) {
        return b.uncertainCountryCount - a.uncertainCountryCount;
      }

      return a.regionName.localeCompare(b.regionName);
    });
  }, [coverageSort, filteredRegionCoverageSummaries]);
  const coveragePanelCopyList = useMemo(() => {
    if (coveragePanelView === "brands") {
      return formatBrandCoverageList(sortedBrandCoverageSummaries);
    }

    if (coveragePanelView === "countries") {
      return formatCountryCoverageList(
        sortedCountryCoverageSummaries,
        countryRegionLookup,
      );
    }

    return formatRegionCoverageList(sortedRegionCoverageSummaries);
  }, [
    countryRegionLookup,
    coveragePanelView,
    sortedBrandCoverageSummaries,
    sortedCountryCoverageSummaries,
    sortedRegionCoverageSummaries,
  ]);

  const shareUrl = useMemo(
    () =>
      buildShareUrl(
        activeSelectedBrand,
        resolvedSelectedCountry,
        coveragePanelView,
        coverageSearchQuery,
        showOnlyUncertainCoverage,
        selectedCoverageRegion,
        coverageSort,
        showOnlyUncertainFootprint,
        footprintSort,
        footprintSearchQuery,
      ),
    [
      activeSelectedBrand,
      coveragePanelView,
      coverageSearchQuery,
      showOnlyUncertainCoverage,
      coverageSort,
      showOnlyUncertainFootprint,
      footprintSort,
      footprintSearchQuery,
      resolvedSelectedCountry,
      selectedCoverageRegion,
    ],
  );
  const copySources = (targetKey: string, sources: string[]) => {
    if (!navigator.clipboard?.writeText) {
      setCopySourcesState({ key: targetKey, status: "failed" });
      return;
    }

    setCopySourcesState({ key: targetKey, status: "copied" });
    void navigator.clipboard.writeText(sources.join("\n")).catch(() => {
      setCopySourcesState({ key: targetKey, status: "failed" });
    });
  };
  const copyBrandWebsite = () => {
    if (!selectedBrandWebsite || !navigator.clipboard?.writeText) {
      setCopyBrandWebsiteStatus("failed");
      return;
    }

    setCopyBrandWebsiteStatus("copied");
    void navigator.clipboard.writeText(selectedBrandWebsite).catch(() => {
      setCopyBrandWebsiteStatus("failed");
    });
  };
  const copyBrandMarkets = () => {
    if (selectedBrandMarketList.length === 0 || !navigator.clipboard?.writeText) {
      setCopyBrandMarketsStatus("failed");
      return;
    }

    setCopyBrandMarketsStatus("copied");
    void navigator.clipboard.writeText(selectedBrandMarketList.join("\n")).catch(() => {
      setCopyBrandMarketsStatus("failed");
    });
  };
  const copyVisibleCoverage = () => {
    if (coveragePanelCopyList.length === 0 || !navigator.clipboard?.writeText) {
      setCopyCoverageStatus("failed");
      return;
    }

    setCopyCoverageStatus("copied");
    void navigator.clipboard.writeText(coveragePanelCopyList.join("\n")).catch(() => {
      setCopyCoverageStatus("failed");
    });
  };
  const copyMajorRegionGaps = () => {
    if (majorRegionGapCopyList.length === 0 || !navigator.clipboard?.writeText) {
      setCopyMajorRegionGapsStatus("failed");
      return;
    }

    setCopyMajorRegionGapsStatus("copied");
    void navigator.clipboard.writeText(majorRegionGapCopyList.join("\n")).catch(() => {
      setCopyMajorRegionGapsStatus("failed");
    });
  };
  const hasCustomView = Boolean(
    activeSelectedBrand ||
      resolvedSelectedCountry ||
      selectedCoverageRegion ||
      coveragePanelView !== "brands" ||
      showOnlyUncertainCoverage ||
      showOnlyUncertainFootprint ||
      coverageSort !== DEFAULT_COVERAGE_SORT ||
      footprintSort !== DEFAULT_FOOTPRINT_SORT ||
      coverageSearchQuery ||
      footprintSearchQuery,
  );
  const activeViewFilters: ActiveViewFilter[] = [
    activeSelectedBrand
      ? {
          key: "brand",
          label: `Brand: ${activeSelectedBrand}`,
          clearLabel: "Clear active brand filter",
          onClear: clearBrandSelection,
        }
      : null,
    selectedCoverageRegion
      ? {
          key: "region",
          label: `Region: ${selectedCoverageRegion}`,
          clearLabel: "Clear active region filter",
          onClear: clearCoverageRegion,
        }
      : null,
    resolvedSelectedCountry
      ? {
          key: "country",
          label: `Country: ${
            resolvedSelectedCountry.countryName ?? resolvedSelectedCountry.isoCode
          } (${resolvedSelectedCountry.isoCode})`,
          clearLabel: "Clear active country selection",
          onClear: clearSelectedCountry,
        }
      : null,
    !activeSelectedBrand && coveragePanelView !== "brands"
      ? {
          key: "coverage-view",
          label: `Coverage view: ${getCoveragePanelViewLabel(coveragePanelView)}`,
          clearLabel: "Reset coverage view",
          onClear: () => setCoveragePanelView("brands"),
        }
      : null,
    !activeSelectedBrand && showOnlyUncertainCoverage
      ? {
          key: "coverage-uncertain",
          label: "Uncertain only",
          clearLabel: "Clear uncertain-only filter",
          onClear: () => setShowOnlyUncertainCoverage(false),
        }
      : null,
    !activeSelectedBrand && coverageSearchQuery.trim()
      ? {
          key: "coverage-search",
          label: `Coverage search: ${coverageSearchQuery.trim()}`,
          clearLabel: "Clear coverage search query",
          onClear: clearCoverageSearch,
        }
      : null,
    activeSelectedBrand && footprintSearchQuery.trim()
      ? {
          key: "footprint-search",
          label: `Footprint search: ${footprintSearchQuery.trim()}`,
          clearLabel: "Clear footprint search query",
          onClear: clearFootprintSearch,
        }
      : null,
    activeSelectedBrand && showOnlyUncertainFootprint
      ? {
          key: "footprint-uncertain",
          label: "Uncertain footprint only",
          clearLabel: "Clear uncertain-only footprint filter",
          onClear: clearFootprintUncertainFilter,
        }
      : null,
  ].filter((filter): filter is ActiveViewFilter => filter !== null);
  const legendItems = useMemo(
    () =>
      getLegendItems(activeSelectedBrand || undefined, {
        hasUncertainEntries: selectedBrandHasUncertainPresence,
      }),
    [activeSelectedBrand, selectedBrandHasUncertainPresence],
  );

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/ne_110m_countries.geojson")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
      })
      .then((geojson: FeatureCollection) => {
        setCountries(geojson);
        setCountriesError(null);
      })
      .catch((err) => {
        console.error("Failed to load country boundaries:", err);
        setCountriesError(
          "The world boundary dataset could not be loaded for this session.",
        );
      });
  }, []);

  useEffect(() => {
    if (!data || !selectedBrand || data.brands[selectedBrand]) {
      return;
    }

    clearBrandSelection();
  }, [data, selectedBrand]);

  useEffect(() => {
    if (!selectedCountry || countryOptions.length === 0) {
      return;
    }

    if (countryOptions.some((option) => option.isoCode === selectedCountry.isoCode)) {
      return;
    }

    setSelectedCountry(null);
  }, [countryOptions, selectedCountry]);

  useEffect(() => {
    if (
      !selectedCoverageRegion ||
      Object.keys(countryRegionLookup).length === 0 ||
      !availableRegions.includes(selectedCoverageRegion)
    ) {
      return;
    }

    if (
      selectedCountry &&
      countryRegionLookup[selectedCountry.isoCode] &&
      countryRegionLookup[selectedCountry.isoCode] !== selectedCoverageRegion
    ) {
      setSelectedCountry(null);
    }

    if (
      hoveredCountry &&
      countryRegionLookup[hoveredCountry.isoCode] &&
      countryRegionLookup[hoveredCountry.isoCode] !== selectedCoverageRegion
    ) {
      setHoveredCountry(null);
    }
  }, [
    availableRegions,
    countryRegionLookup,
    hoveredCountry,
    selectedCountry,
    selectedCoverageRegion,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      const nextState = getSelectionStateFromSearch(window.location.search);

      skipNextCoverageSearchReset.current = true;
      skipNextFootprintSearchReset.current = true;
      setSelectedBrand(nextState.selectedBrand);
      setBrandLookupQuery(nextState.selectedBrand);
      setSelectedCountry(nextState.selectedCountry);
      setCoveragePanelView(nextState.coveragePanelView);
      setCoverageSearchQuery(nextState.coverageSearchQuery);
      setShowOnlyUncertainCoverage(nextState.showOnlyUncertainCoverage);
      setSelectedCoverageRegion(nextState.selectedCoverageRegion);
      setCoverageSort(nextState.coverageSort);
      setShowOnlyUncertainFootprint(nextState.showOnlyUncertainFootprint);
      setFootprintSort(nextState.footprintSort);
      setFootprintSearchQuery(nextState.footprintSearchQuery);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        brandFilterInputRef.current?.focus();
        brandFilterInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const currentBrand = url.searchParams.get("brand")?.trim() ?? "";
    const currentCountry = normalizeIsoCode(url.searchParams.get("country"));
    const currentState = getSelectionStateFromSearch(url.search);

    if (
      currentBrand === activeSelectedBrand &&
      currentCountry === resolvedSelectedCountry?.isoCode &&
      currentState.coveragePanelView === coveragePanelView &&
      currentState.coverageSearchQuery === coverageSearchQuery &&
      currentState.showOnlyUncertainCoverage === showOnlyUncertainCoverage &&
      currentState.selectedCoverageRegion === selectedCoverageRegion &&
      currentState.coverageSort === coverageSort &&
      currentState.showOnlyUncertainFootprint === showOnlyUncertainFootprint &&
      currentState.footprintSort === footprintSort &&
      currentState.footprintSearchQuery === footprintSearchQuery
    ) {
      return;
    }

    const nextUrl = buildShareUrl(
      activeSelectedBrand,
      resolvedSelectedCountry,
      coveragePanelView,
        coverageSearchQuery,
        showOnlyUncertainCoverage,
        selectedCoverageRegion,
        coverageSort,
        showOnlyUncertainFootprint,
        footprintSort,
        footprintSearchQuery,
      );
    window.history.replaceState({}, "", nextUrl);
  }, [
    activeSelectedBrand,
    coveragePanelView,
    coverageSearchQuery,
    showOnlyUncertainCoverage,
    coverageSort,
    showOnlyUncertainFootprint,
    footprintSort,
    footprintSearchQuery,
    resolvedSelectedCountry,
    selectedCoverageRegion,
  ]);

  useEffect(() => {
    if (!hasInitializedCopyLinkReset.current) {
      hasInitializedCopyLinkReset.current = true;
      return;
    }

    setCopyLinkStatus("idle");
  }, [shareUrl]);

  useEffect(() => {
    if (!hasInitializedCopyCountryReset.current) {
      hasInitializedCopyCountryReset.current = true;
      return;
    }

    setCopyCountryStatus("idle");
  }, [resolvedSelectedCountry]);

  useEffect(() => {
    if (!hasInitializedCopyBrandWebsiteReset.current) {
      hasInitializedCopyBrandWebsiteReset.current = true;
      return;
    }

    setCopyBrandWebsiteStatus("idle");
  }, [activeSelectedBrand]);

  useEffect(() => {
    if (!hasInitializedCopyBrandMarketsReset.current) {
      hasInitializedCopyBrandMarketsReset.current = true;
      return;
    }

    setCopyBrandMarketsStatus("idle");
  }, [selectedBrandMarketList]);

  useEffect(() => {
    if (!hasInitializedCopyCoverageReset.current) {
      hasInitializedCopyCoverageReset.current = true;
      return;
    }

    setCopyCoverageStatus("idle");
  }, [coveragePanelCopyList, coveragePanelView]);

  useEffect(() => {
    if (!hasInitializedCopyMajorRegionGapsReset.current) {
      hasInitializedCopyMajorRegionGapsReset.current = true;
      return;
    }

    setCopyMajorRegionGapsStatus("idle");
  }, [majorRegionGapCopyList]);

  useEffect(() => {
    if (!hasInitializedCopySourcesReset.current) {
      hasInitializedCopySourcesReset.current = true;
      return;
    }

    setCopySourcesState({ key: null, status: "idle" });
  }, [activeSelectedBrand, resolvedSelectedCountry]);

  useEffect(() => {
    if (!hasInitializedCoverageSearchReset.current) {
      hasInitializedCoverageSearchReset.current = true;
      return;
    }

    if (skipNextCoverageSearchReset.current) {
      skipNextCoverageSearchReset.current = false;
      return;
    }

    setCoverageSearchQuery("");
  }, [activeSelectedBrand, coveragePanelView, selectedCoverageRegion]);

  useEffect(() => {
    if (!hasInitializedFootprintSearchReset.current) {
      hasInitializedFootprintSearchReset.current = true;
      return;
    }

    if (skipNextFootprintSearchReset.current) {
      skipNextFootprintSearchReset.current = false;
      return;
    }

    setFootprintSearchQuery("");
  }, [activeSelectedBrand]);

  useEffect(() => {
    setActiveBrandLookupIndex(-1);
  }, [brandLookupQuery, shouldShowBrandLookupMatches]);

  useEffect(() => {
    setActiveCountryLookupIndex(-1);
  }, [countryLookupQuery, shouldShowCountryLookupMatches]);

  useEffect(() => {
    setCountryLookupQuery(getCountryLookupValue(resolvedSelectedCountry));
  }, [resolvedSelectedCountry]);

  useEffect(() => {
    if (
      !selectedCoverageRegion ||
      !countries ||
      availableRegions.includes(selectedCoverageRegion)
    ) {
      return;
    }

    setSelectedCoverageRegion("");
  }, [availableRegions, countries, selectedCoverageRegion]);

  const fillColor = buildColorExpression(visibleCountryBrandCount, {
    selectedBrand: activeSelectedBrand || undefined,
    uncertainCountryCodes: selectedBrandUncertainCountryCodes,
  });
  const mapFocusState = useMemo(() => {
    if (resolvedSelectedCountry && visibleCountries) {
      return {
        key: `country:${resolvedSelectedCountry.isoCode}`,
        bounds: getFeatureBounds(visibleCountries, [resolvedSelectedCountry.isoCode]),
      };
    }

    if (selectedCoverageRegion && visibleCountries) {
      return {
        key: `region:${selectedCoverageRegion}`,
        bounds: getFeatureBounds(visibleCountries),
      };
    }

    return { key: "default", bounds: null };
  }, [resolvedSelectedCountry, selectedCoverageRegion, visibleCountries]);
  const mapStatus = loading
    ? {
        title: "Loading verified EV data",
        description:
          "Fetching the latest confirmed market presence before rendering the map.",
      }
    : error
      ? {
          title: "Dataset load failed",
          description: error,
        }
      : !data
      ? {
          title: "Map data unavailable",
          description:
            "The verified EV presence dataset could not be loaded for this session.",
        }
      : countriesError
        ? {
            title: "Map boundaries unavailable",
            description: countriesError,
          }
      : !visibleCountries
        ? {
            title: "Loading country boundaries",
            description:
              "Preparing the world geometry so the verified dataset can be plotted on the map.",
          }
        : {
            title: "Loading interactive map",
            description:
              "The data panels are ready while the interactive MapLibre canvas finishes loading.",
          };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100">
      <div className="absolute inset-0">
        {data && visibleCountries ? (
          <Suspense
            fallback={
              <MapViewportStatus
                title={mapStatus.title}
                description={mapStatus.description}
              />
            }
          >
            <MapCanvas
              countries={visibleCountries}
              fillColor={fillColor}
              focusBounds={mapFocusState.bounds}
              focusTargetKey={mapFocusState.key}
              onHoveredCountryChange={setHoveredCountry}
              onSelectedCountryChange={setSelectedCountry}
            />
          </Suspense>
        ) : (
          <MapViewportStatus
            title={mapStatus.title}
            description={mapStatus.description}
          />
        )}
      </div>

      {visibleSummary ? (
        <div className="absolute top-6 left-6 bg-white/90 rounded-lg shadow-md px-4 py-3 max-w-xs">
          <h2 className="text-sm font-semibold text-gray-800">
            Dataset summary
          </h2>
          <div className="mt-3">
            <label
              htmlFor="brand-filter"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Brand filter
            </label>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <input
                  ref={brandFilterInputRef}
                  id="brand-filter"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls={
                    shouldShowBrandLookupMatches
                      ? "brand-filter-suggestions"
                      : undefined
                  }
                  aria-expanded={shouldShowBrandLookupMatches}
                  aria-activedescendant={
                    shouldShowBrandLookupMatches && activeBrandLookupIndex >= 0
                      ? `brand-filter-suggestion-${activeBrandLookupIndex}`
                      : undefined
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  placeholder="Search by brand name"
                  disabled={brandOptions.length === 0}
                  value={brandLookupQuery}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    const exactMatch = findBrandLookupMatch(brandOptions, nextQuery);

                    setBrandLookupQuery(nextQuery);

                    if (!nextQuery.trim()) {
                      clearBrandSelection();
                      return;
                    }

                    if (exactMatch) {
                      applyBrandSelection(exactMatch);
                      return;
                    }

                    if (activeSelectedBrand) {
                      setSelectedBrand("");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      shouldShowBrandLookupMatches &&
                      filteredBrandOptions.length > 0 &&
                      ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                    ) {
                      event.preventDefault();
                      setActiveBrandLookupIndex((currentIndex) =>
                        getNextLookupIndex(
                          currentIndex,
                          filteredBrandOptions.length,
                          event.key,
                        ),
                      );
                      return;
                    }

                     if (
                       event.key === "Enter" &&
                       shouldShowBrandLookupMatches &&
                       (filteredBrandOptions[activeBrandLookupIndex] ||
                         (activeBrandLookupIndex < 0 && filteredBrandOptions.length === 1))
                     ) {
                       event.preventDefault();
                       const selectedBrandOption =
                         filteredBrandOptions[activeBrandLookupIndex] ??
                         filteredBrandOptions[0];
                       applyBrandSelection(
                         selectedBrandOption,
                       );
                       return;
                     }

                    if (event.key !== "Escape") {
                      return;
                    }

                    if (!brandLookupQuery && !activeSelectedBrand) {
                      return;
                    }

                    event.preventDefault();
                    clearBrandSelection();
                  }}
                />
                {brandLookupQuery || activeSelectedBrand ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={clearBrandSelection}
                    aria-label="Clear brand filter"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Type a brand name to focus the map on a single confirmed footprint.
              </p>
              {shouldShowBrandLookupMatches ? (
                <div className="mt-2 rounded-md border border-gray-200 bg-white">
                  <p className="border-b border-gray-200 px-3 py-2 text-xs text-gray-500">
                    Showing {filteredBrandOptions.length} matching{" "}
                    {filteredBrandOptions.length === 1 ? "brand" : "brands"}
                  </p>
                  {filteredBrandOptions.length > 0 ? (
                    <ul
                      id="brand-filter-suggestions"
                      role="listbox"
                      className="max-h-48 overflow-y-auto py-1"
                    >
                      {filteredBrandOptions.map((brandName, index) => {
                        const coverageSummary =
                          brandLookupCoverageSummaryByName.get(brandName);

                        return (
                          <li key={brandName}>
                            <button
                              type="button"
                              id={`brand-filter-suggestion-${index}`}
                              role="option"
                              aria-label={brandName}
                              aria-selected={index === activeBrandLookupIndex}
                              className={`w-full px-3 py-2 text-left ${
                                index === activeBrandLookupIndex
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => applyBrandSelection(brandName)}
                              onMouseEnter={() => setActiveBrandLookupIndex(index)}
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {brandName}
                              </p>
                              {coverageSummary ? (
                                <p className="mt-1 text-xs text-gray-500">
                                  {coverageSummary.confirmedCountryCount.toLocaleString()}{" "}
                                  confirmed{" "}
                                  {coverageSummary.confirmedCountryCount === 1
                                    ? "market"
                                    : "markets"}
                                  {coverageSummary.uncertainCountryCount > 0
                                    ? ` · ${coverageSummary.uncertainCountryCount.toLocaleString()} uncertain`
                                    : ""}
                                </p>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-600">
                      No brands match this search yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            <label
              htmlFor="region-filter"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Region filter
            </label>
            <div className="mt-1 flex items-center gap-2">
              <select
                id="region-filter"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                disabled={availableRegions.length === 0}
                value={selectedCoverageRegion}
                onChange={(event) => setSelectedCoverageRegion(event.target.value)}
              >
                <option value="">All regions</option>
                {availableRegions.map((regionName) => (
                  <option key={regionName} value={regionName}>
                    {regionName}
                  </option>
                ))}
              </select>
              {selectedCoverageRegion ? (
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={clearCoverageRegion}
                  aria-label="Clear region filter"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Focus the map and panels on one world region at a time.
            </p>
          </div>
          <div className="mt-3">
            <label
              htmlFor="country-filter"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Country lookup
            </label>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <input
                  id="country-filter"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls={
                    shouldShowCountryLookupMatches
                      ? "country-filter-suggestions"
                      : undefined
                  }
                  aria-expanded={shouldShowCountryLookupMatches}
                  aria-activedescendant={
                    shouldShowCountryLookupMatches && activeCountryLookupIndex >= 0
                      ? `country-filter-suggestion-${activeCountryLookupIndex}`
                      : undefined
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  placeholder="Search by country or ISO code"
                  disabled={countryOptions.length === 0}
                  value={countryLookupQuery}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    const exactMatch = findCountryLookupMatch(
                      countryOptions,
                      nextQuery,
                    );

                    setCountryLookupQuery(nextQuery);

                    if (!nextQuery.trim()) {
                      setSelectedCountry(null);
                      return;
                    }

                    if (exactMatch) {
                      setSelectedCountry({
                        isoCode: exactMatch.isoCode,
                        countryName: exactMatch.countryName,
                      });
                      return;
                    }

                    if (resolvedSelectedCountry) {
                      setSelectedCountry(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      shouldShowCountryLookupMatches &&
                      filteredCountryOptions.length > 0 &&
                      ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                    ) {
                      event.preventDefault();
                      setActiveCountryLookupIndex((currentIndex) =>
                        getNextLookupIndex(
                          currentIndex,
                          filteredCountryOptions.length,
                          event.key,
                        ),
                      );
                      return;
                    }

                     if (
                       event.key === "Enter" &&
                       shouldShowCountryLookupMatches &&
                       (filteredCountryOptions[activeCountryLookupIndex] ||
                         (activeCountryLookupIndex < 0 &&
                           filteredCountryOptions.length === 1))
                     ) {
                       event.preventDefault();
                       const selectedCountryOption =
                         filteredCountryOptions[activeCountryLookupIndex] ??
                         filteredCountryOptions[0];
                       setSelectedCountry({
                         isoCode: selectedCountryOption.isoCode,
                         countryName: selectedCountryOption.countryName,
                       });
                       return;
                     }

                    if (event.key !== "Escape") {
                      return;
                    }

                    if (!countryLookupQuery && !resolvedSelectedCountry) {
                      return;
                    }

                    event.preventDefault();
                    setCountryLookupQuery("");
                    setSelectedCountry(null);
                  }}
                />
                {countryLookupQuery || resolvedSelectedCountry ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={clearSelectedCountry}
                    aria-label="Clear country lookup"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Type a country name or ISO code to jump straight into its details.
              </p>
              {shouldShowCountryLookupMatches ? (
                <div className="mt-2 rounded-md border border-gray-200 bg-white">
                  <p className="border-b border-gray-200 px-3 py-2 text-xs text-gray-500">
                    Showing {filteredCountryOptions.length} matching{" "}
                    {filteredCountryOptions.length === 1 ? "country" : "countries"}
                  </p>
                  {filteredCountryOptions.length > 0 ? (
                    <ul
                      id="country-filter-suggestions"
                      role="listbox"
                      className="max-h-48 overflow-y-auto py-1"
                    >
                      {filteredCountryOptions.map((country, index) => (
                        <li key={country.isoCode}>
                          <button
                            type="button"
                            id={`country-filter-suggestion-${index}`}
                            role="option"
                            aria-selected={index === activeCountryLookupIndex}
                            className={`w-full px-3 py-2 text-left ${
                              index === activeCountryLookupIndex
                                ? "bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedCountry({
                                isoCode: country.isoCode,
                                countryName: country.countryName,
                              });
                            }}
                            onMouseEnter={() => setActiveCountryLookupIndex(index)}
                          >
                            <p className="text-sm font-medium text-gray-800">
                              {country.countryName}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              {country.isoCode}
                              {country.regionName ? ` · ${country.regionName}` : ""}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-600">
                      No countries match this search yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          {activeViewFilters.length > 0 ? (
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-blue-900">
                Active view
              </h3>
              <p className="mt-1 text-xs text-blue-900/80">
                Clear the filters shaping the current map and exports without
                resetting the whole view.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeViewFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-left text-xs font-medium text-blue-900 hover:border-blue-300 hover:text-blue-950"
                    onClick={filter.onClear}
                    aria-label={filter.clearLabel}
                  >
                    <span>{filter.label}</span>
                    <span aria-hidden="true" className="text-sm leading-none">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!hasCustomView}
                onClick={resetView}
              >
                Reset view
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (!shareUrl || !navigator.clipboard?.writeText) {
                    setCopyLinkStatus("failed");
                    return;
                  }

                  setCopyLinkStatus("copied");
                  void navigator.clipboard.writeText(shareUrl).catch(() => {
                    setCopyLinkStatus("failed");
                  });
                }}
              >
                {copyLinkStatus === "copied"
                  ? "Copied share link"
                  : copyLinkStatus === "failed"
                    ? "Copy failed"
                    : "Copy share link"}
              </button>
            </div>
            {shareUrl ? (
              <a
                className="mt-2 block text-center text-sm font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open share link in a new tab"
              >
                Open share link
              </a>
            ) : null}
          </div>
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!exportData}
                onClick={() => {
                  if (!exportData) {
                    return;
                  }

                  downloadTextFile(
                    serializePresenceDataToCsv(exportData, countryRegionLookup),
                    `${exportFileBaseName}.csv`,
                    "text/csv;charset=utf-8",
                  );
                }}
              >
                Download CSV
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!exportData}
                onClick={() => {
                  if (!exportData) {
                    return;
                  }

                  downloadTextFile(
                    serializePresenceDataToJson(exportData),
                    `${exportFileBaseName}.json`,
                    "application/json;charset=utf-8",
                  );
                }}
              >
                Download JSON
              </button>
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={exportSourceUrls.length === 0}
              onClick={() =>
                copySources("view:all-sources", exportSourceUrls)
              }
            >
              {getCopyAllSourcesButtonLabel(
                copySourcesState,
                "view:all-sources",
                "Copy all sources in view",
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Export the currently filtered dataset for offline analysis.
            </p>
          </div>
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Showing</dt>
              <dd className="font-medium text-gray-800">
                {visibleSummary.visibleBrandLabel}
                {selectedCoverageRegion ? ` · ${selectedCoverageRegion}` : ""}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Brands tracked</dt>
              <dd className="font-medium text-gray-800">
                {visibleSummary.brandCount}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Countries in view</dt>
              <dd className="font-medium text-gray-800">
                {visibleSummary.visibleCountryCount}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Last updated</dt>
              <dd className="font-medium text-gray-800">
                {visibleSummary.lastUpdated}
              </dd>
            </div>
          </dl>
          {majorRegionGapSummaries.length > 0 ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-amber-900">
                    Major region gaps
                  </h3>
                  <p className="mt-1 text-xs text-amber-900/80">
                    {activeSelectedBrand
                      ? "This brand still has no confirmed presence in these major EV regions."
                      : "Tracked brands with the biggest remaining major-region white space."}
                  </p>
                  <div className="mt-1">
                    <button
                      type="button"
                      className="text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950 disabled:text-amber-900/50 disabled:no-underline"
                      onClick={copyMajorRegionGaps}
                      disabled={majorRegionGapCopyList.length === 0}
                    >
                      {copyMajorRegionGapsStatus === "copied"
                        ? "Copied gap priorities"
                        : copyMajorRegionGapsStatus === "failed"
                          ? "Gap priorities copy failed"
                          : "Copy gap priorities"}
                    </button>
                  </div>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-amber-900">
                  {activeSelectedBrand ? "Global scan" : "Top gaps"}
                </span>
              </div>
              {selectedCoverageRegion ? (
                <p className="mt-2 text-xs text-amber-900/70">
                  This gap scan stays global so you can compare expansion priorities
                  beyond the current region filter.
                </p>
              ) : null}
              <ul className="mt-3 space-y-2">
                {majorRegionGapSummaries.map((summary) => (
                  <li
                    key={summary.brandName}
                    className="rounded-md border border-amber-200 bg-white px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {summary.brandName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {summary.confirmedCountryCount.toLocaleString()} confirmed{" "}
                          {summary.confirmedCountryCount === 1 ? "market" : "markets"} ·{" "}
                          {summary.coveredMajorRegionCount}/4 major regions covered
                        </p>
                      </div>
                      {!activeSelectedBrand ? (
                        <button
                          type="button"
                          className="shrink-0 rounded-md border border-amber-200 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
                          onClick={() => applyBrandSelection(summary.brandName)}
                        >
                          Show {summary.brandName} footprint
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {summary.missingRegions.map((regionName) => (
                        <button
                          key={`${summary.brandName}:${regionName}`}
                          type="button"
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${
                            activeSelectedBrand === summary.brandName &&
                            activeMajorRegionGap === regionName
                              ? "border-amber-300 bg-amber-200 text-amber-950"
                              : "border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-200"
                          }`}
                          aria-pressed={
                            activeSelectedBrand === summary.brandName &&
                            activeMajorRegionGap === regionName
                          }
                          aria-label={`Inspect ${summary.brandName} gap in ${regionName}`}
                          onClick={() => {
                            if (
                              activeSelectedBrand === summary.brandName &&
                              activeMajorRegionGap === regionName
                            ) {
                              clearMajorRegionGap();
                              return;
                            }

                            focusBrandMajorRegionGap(summary.brandName, regionName);
                          }}
                        >
                          {regionName}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {hoveredCountryDetails ? (
        <div className="pointer-events-none absolute top-6 left-1/2 z-10 w-full max-w-xs -translate-x-1/2 px-4">
          <div className="pointer-events-auto rounded-lg bg-white/95 px-4 py-3 shadow-md">
            <h2 className="text-sm font-semibold text-gray-800">Map preview</h2>
            <div className="mt-1 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {hoveredCountryDetails.countryName}
                </p>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {hoveredCountryDetails.isoCode} · {hoveredCountryDetails.brands.length}{" "}
                  {hoveredCountryDetails.brands.length === 1 ? "brand" : "brands"}
                </p>
              </div>
            </div>
            {hoveredCountryDetails.brands.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {hoveredCountryDetails.brands.map((brand) => (
                  <li
                    key={brand.brandName}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {brand.brandName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                          <button
                            type="button"
                            className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                            onClick={() => applyBrandSelection(brand.brandName)}
                          >
                            {activeSelectedBrand === brand.brandName
                              ? "Showing footprint"
                              : `Show ${brand.brandName} footprint`}
                          </button>
                          {brand.source ? (
                            <a
                              href={brand.source}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                              aria-label={`Open official source for ${brand.brandName} in ${hoveredCountryDetails.countryName}`}
                            >
                              Source
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {brand.sources.length > 0 ? (
                          <span
                            className={getSourceCountBadgeClassName(brand.sources.length)}
                            title={getSourceCountBadgeTitle(brand.sources.length)}
                          >
                            {getSourceCountLabel(brand.sources.length)}
                          </span>
                        ) : null}
                        {brand.uncertain ? (
                          <span
                            className="cursor-help rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                            title={UNCERTAIN_BADGE_TOOLTIP}
                          >
                            Uncertain
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-gray-600">
                No tracked official brand presence for this country in the current
                view.
              </p>
            )}
            {activeSelectedBrand &&
            allHoveredCountryDetails &&
            allHoveredCountryDetails.brands.length > hoveredCountryDetails.brands.length ? (
              <p className="mt-2 text-xs text-gray-500">
                Showing {hoveredCountryDetails.brands.length} of{" "}
                {allHoveredCountryDetails.brands.length} tracked brands for this
                country. Clear the brand filter to see the rest.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {selectedCountryDetails ? (
        <aside
          className="absolute top-6 right-6 max-w-sm rounded-lg bg-white/95 px-4 py-3 shadow-md"
          aria-labelledby="selected-country-heading"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key !== "Escape") {
              return;
            }

            event.preventDefault();
            setSelectedCountry(null);
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="selected-country-heading"
                className="text-sm font-semibold text-gray-800"
              >
                {selectedCountryDetails.countryName}
              </h2>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {selectedCountryDetails.isoCode} · {selectedCountryDetails.brands.length}{" "}
                {selectedCountryDetails.brands.length === 1 ? "brand" : "brands"}
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                onClick={() => {
                  if (!navigator.clipboard?.writeText) {
                    setCopyCountryStatus("failed");
                    return;
                  }

                  setCopyCountryStatus("copied");
                  void navigator.clipboard
                    .writeText(
                      `${selectedCountryDetails.countryName} (${selectedCountryDetails.isoCode})`,
                    )
                    .catch(() => {
                      setCopyCountryStatus("failed");
                    });
                }}
              >
                {copyCountryStatus === "copied"
                  ? "Copied country + ISO"
                  : copyCountryStatus === "failed"
                    ? "Country copy failed"
                    : "Copy country + ISO"}
              </button>
              {selectedCountryAllSources.length > 0 ? (
                <button
                  type="button"
                  className="mt-2 block text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                  onClick={() =>
                    copySources(
                      `${selectedCountryDetails.isoCode}:all-sources`,
                      selectedCountryAllSources,
                    )
                  }
                >
                  {getCopyAllSourcesButtonLabel(
                    copySourcesState,
                    `${selectedCountryDetails.isoCode}:all-sources`,
                  )}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedCountry(null)}
            >
              Close
            </button>
          </div>

          <ul className="mt-3 space-y-3">
            {selectedCountryDetails.brands.length === 0 ? (
              <>
                <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                  No tracked official brand presence for this country in the current
                  view.
                </li>
                {selectedCountryRegionSuggestions?.brands.length ? (
                  <li className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Brands active elsewhere in {selectedCountryRegionSuggestions.regionName}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Explore tracked brands already confirmed in nearby markets
                      across this region.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCountryRegionSuggestions.brands.map((brand) => (
                        <button
                          key={brand.brandName}
                          type="button"
                          className="rounded-full border border-gray-300 px-3 py-1 text-left text-xs text-gray-700 hover:border-blue-300 hover:text-blue-700"
                          onClick={() => applyBrandSelection(brand.brandName)}
                        >
                          <span className="font-medium">{brand.brandName}</span>
                          <span className="text-gray-500">
                            {" "}
                            · {brand.confirmedCountryCount}{" "}
                            {brand.confirmedCountryCount === 1 ? "market" : "markets"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </li>
                ) : null}
              </>
            ) : (
              selectedCountryDetails.brands.map((brand) => (
                <li
                  key={brand.brandName}
                  className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {brand.brandName}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <button
                          type="button"
                          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                          onClick={() => applyBrandSelection(brand.brandName)}
                        >
                          {activeSelectedBrand === brand.brandName
                            ? "Showing footprint"
                            : `Show ${brand.brandName} footprint`}
                        </button>
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                          aria-label={`Open official website for ${brand.brandName}`}
                        >
                          Website
                        </a>
                        <button
                          type="button"
                          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                          onClick={() =>
                            copySources(
                              `${selectedCountryDetails.isoCode}:${brand.brandName}`,
                              brand.sources,
                            )
                          }
                        >
                          {getCopySourcesButtonLabel(
                            copySourcesState,
                            `${selectedCountryDetails.isoCode}:${brand.brandName}`,
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {brand.sources.length > 0 ? (
                        <span
                          className={getSourceCountBadgeClassName(brand.sources.length)}
                          title={getSourceCountBadgeTitle(brand.sources.length)}
                        >
                          {getSourceCountLabel(brand.sources.length)}
                        </span>
                      ) : null}
                      {brand.uncertain ? (
                        <span
                          className="cursor-help rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                          title={UNCERTAIN_BADGE_TOOLTIP}
                        >
                          Uncertain
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-blue-700">
                    {brand.sources.map((source) => (
                      <li key={source}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all underline underline-offset-2"
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
          {activeSelectedBrand &&
          allSelectedCountryDetails &&
          allSelectedCountryDetails.brands.length > selectedCountryDetails.brands.length ? (
            <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
              Showing {selectedCountryDetails.brands.length} of{" "}
              {allSelectedCountryDetails.brands.length} tracked brands for this
              country. Clear the brand filter to inspect the rest.
            </p>
          ) : null}
        </aside>
      ) : null}

      {activeSelectedBrand ? (
        <aside
          className="absolute right-6 bottom-6 max-h-80 w-80 overflow-hidden rounded-lg bg-white/95 px-4 py-3 shadow-md"
          aria-labelledby="brand-footprint-heading"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key !== "Escape") {
              return;
            }

            event.preventDefault();
            clearBrandSelection();
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="brand-footprint-heading"
                className="text-sm font-semibold text-gray-800"
              >
                Brand footprint
              </h2>
              <p className="text-xs text-gray-500">
                {activeSelectedBrand} · {selectedBrandPresence.length}{" "}
                {selectedBrandPresence.length === 1 ? "market" : "markets"}
              </p>
              {selectedBrandWebsite ? (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={selectedBrandWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline underline-offset-2"
                    aria-label={`Open official website for ${activeSelectedBrand}`}
                  >
                    Official website
                  </a>
                  <button
                    type="button"
                    className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                    onClick={copyBrandWebsite}
                  >
                    {copyBrandWebsiteStatus === "copied"
                      ? "Copied website URL"
                      : copyBrandWebsiteStatus === "failed"
                        ? "Website copy failed"
                        : "Copy website URL"}
                  </button>
                  <button
                    type="button"
                    className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                    onClick={copyBrandMarkets}
                    disabled={selectedBrandMarketList.length === 0}
                  >
                    {copyBrandMarketsStatus === "copied"
                      ? "Copied visible markets"
                      : copyBrandMarketsStatus === "failed"
                        ? "Visible markets copy failed"
                        : "Copy visible markets"}
                  </button>
                </div>
              ) : null}
              {selectedCoverageRegion ? (
                <p className="mt-1 text-xs text-gray-500">
                  Filtering markets to {selectedCoverageRegion}
                </p>
              ) : null}
              {activeMajorRegionGap ? (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <p className="text-amber-700">
                    Gap focus: {activeMajorRegionGap} still has no confirmed presence
                    for {activeSelectedBrand}.
                  </p>
                  <button
                    type="button"
                    className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
                    onClick={clearMajorRegionGap}
                  >
                    Clear gap focus
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={clearBrandSelection}
            >
              Clear
            </button>
          </div>

          {selectedBrandRegionCoverageSummaries.length > 1 ? (
            <div className="mt-3">
              <p className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Footprint regions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full border px-3 py-1 text-left text-xs ${
                    selectedCoverageRegion
                      ? "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700"
                      : "border-blue-200 bg-blue-50 text-blue-800"
                  }`}
                  aria-pressed={!selectedCoverageRegion}
                  onClick={() => setSelectedCoverageRegion("")}
                >
                  <span className="font-medium">All regions</span>
                  <span className="text-gray-500">
                    {" "}
                    · {selectedBrandTotalCountryCount}{" "}
                    {selectedBrandTotalCountryCount === 1 ? "market" : "markets"}
                  </span>
                </button>
                {selectedBrandRegionCoverageSummaries.map((region) => {
                  const totalCountryCount =
                    region.confirmedCountryCount + region.uncertainCountryCount;
                  const isActive = selectedCoverageRegion === region.regionName;

                  return (
                    <button
                      key={region.regionName}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-left text-xs ${
                        isActive
                          ? "border-blue-200 bg-blue-50 text-blue-800"
                          : "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700"
                      }`}
                      aria-pressed={isActive}
                      onClick={() => setSelectedCoverageRegion(region.regionName)}
                    >
                      <span className="font-medium">{region.regionName}</span>
                      <span className="text-gray-500">
                        {" "}
                        · {totalCountryCount}{" "}
                        {totalCountryCount === 1 ? "market" : "markets"}
                        {region.uncertainCountryCount > 0
                          ? ` · ${region.uncertainCountryCount} uncertain`
                          : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Jump between the regions where this brand has tracked official
                presence.
              </p>
            </div>
          ) : null}

          <div className="mt-3">
            <label
              htmlFor="brand-footprint-search"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Search footprint markets
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="brand-footprint-search"
                type="search"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                placeholder="Filter by country, ISO code, or region"
                value={footprintSearchQuery}
                onChange={(event) => setFootprintSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape" || !footprintSearchQuery) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  clearFootprintSearch();
                }}
              />
              {footprintSearchQuery ? (
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={clearFootprintSearch}
                  aria-label="Clear footprint search"
                >
                  Clear
                </button>
              ) : null}
            </div>
              <p className="mt-2 text-xs text-gray-500">
                Showing {sortedSelectedBrandPresence.length} of{" "}
                {selectedBrandPresence.length}{" "}
                {selectedBrandPresence.length === 1 ? "market" : "markets"}
              </p>
            </div>
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <label className="flex items-start gap-2 text-sm text-amber-950">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                  checked={showOnlyUncertainFootprint}
                  onChange={(event) =>
                    setShowOnlyUncertainFootprint(event.target.checked)
                  }
                />
                <span>Show only uncertain markets</span>
              </label>
            </div>
            <div className="mt-3">
              <label
                htmlFor="footprint-sort"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Sort footprint
            </label>
            <select
              id="footprint-sort"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              value={footprintSort}
              onChange={(event) => {
                if (isFootprintSort(event.target.value)) {
                  setFootprintSort(event.target.value);
                }
              }}
            >
              <option value="name">Country name (A-Z)</option>
              <option value="name-desc">Country name (Z-A)</option>
              <option value="region">Region, then country (A-Z)</option>
              <option value="region-desc">Region, then country (Z-A)</option>
            </select>
          </div>

          <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
            {sortedSelectedBrandPresence.length === 0 ? (
              <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                {getFootprintEmptyStateMessage(
                  showOnlyUncertainFootprint,
                  Boolean(footprintSearchQuery.trim()),
                )}
              </li>
            ) : (
              sortedSelectedBrandPresence.map((country) => (
                <li
                  key={country.isoCode}
                  className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() =>
                        setSelectedCountry({
                          isoCode: country.isoCode,
                          countryName: country.countryName,
                        })
                      }
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {country.countryName}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {country.isoCode}
                        {country.regionName ? ` · ${country.regionName}` : ""}
                      </p>
                      {country.sources.length > 0 ? (
                        <p
                          className="mt-1 text-xs text-gray-500"
                          title={getSourceCountBadgeTitle(country.sources.length)}
                        >
                          {getSourceCountLabel(country.sources.length)}
                        </p>
                      ) : null}
                    </button>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {country.uncertain ? (
                        <span
                          className="cursor-help rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                          title={UNCERTAIN_BADGE_TOOLTIP}
                        >
                          Uncertain
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {country.source ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <a
                        href={country.source}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline underline-offset-2"
                        aria-label={`Open official source for ${country.countryName}`}
                      >
                        Official source
                      </a>
                      <button
                        type="button"
                        className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                        onClick={() =>
                          copySources(`${activeSelectedBrand}:${country.isoCode}`, country.sources)
                        }
                      >
                        {getCopySourcesButtonLabel(
                          copySourcesState,
                          `${activeSelectedBrand}:${country.isoCode}`,
                        )}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </aside>
      ) : brandCoverageSummaries.length > 0 ? (
        <aside className="absolute right-6 bottom-6 max-h-80 w-80 overflow-hidden rounded-lg bg-white/95 px-4 py-3 shadow-md">
          <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {coveragePanelView === "brands"
                  ? "Brand coverage"
                  : coveragePanelView === "countries"
                    ? "Country coverage"
                    : "Regional coverage"}
              </h2>
              <p className="text-xs text-gray-500">
                {coveragePanelView === "brands"
                  ? "Compare confirmed official markets across tracked brands."
                  : coveragePanelView === "countries"
                    ? "See which countries have the widest confirmed tracked brand coverage."
                    : "Compare confirmed coverage across regions and drill into the strongest clusters."}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800 disabled:text-gray-400 disabled:no-underline"
                  onClick={copyVisibleCoverage}
                  disabled={coveragePanelCopyList.length === 0}
                >
                  {getCopyCoverageButtonLabel(
                    coveragePanelView,
                    copyCoverageStatus,
                  )}
                </button>
              </div>
            </div>

          <div
            className="mt-3 inline-flex rounded-md border border-gray-200 bg-gray-50 p-1"
            role="tablist"
            aria-label="Coverage ranking view"
          >
            {COVERAGE_PANEL_VIEWS.map((view) => {
              const isActive = coveragePanelView === view;

              return (
                <button
                  key={view}
                  type="button"
                  id={`coverage-tab-${view}`}
                  role="tab"
                  ref={(element) => {
                    coverageTabRefs.current[view] = element;
                  }}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className={`rounded px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    isActive
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setCoveragePanelView(view)}
                  onKeyDown={(event) => {
                    const nextView = getNextCoveragePanelView(view, event.key);

                    if (!nextView) {
                      return;
                    }

                    event.preventDefault();
                    setCoveragePanelView(nextView);
                    coverageTabRefs.current[nextView]?.focus();
                  }}
                >
                  {view === "brands"
                    ? "Brands"
                    : view === "countries"
                      ? "Countries"
                      : "Regions"}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <label
              htmlFor="coverage-search"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              {coveragePanelView === "brands"
                ? "Search brand coverage"
                : coveragePanelView === "countries"
                  ? "Search country coverage"
                  : "Search regional coverage"}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="coverage-search"
                type="search"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                placeholder={
                  coveragePanelView === "brands"
                    ? "Filter by brand name"
                    : coveragePanelView === "countries"
                      ? "Filter by country, ISO code, region, or brand"
                      : "Filter by region or active brand"
                }
                value={coverageSearchQuery}
                onChange={(event) => setCoverageSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape" || !coverageSearchQuery) {
                    return;
                  }

                  event.preventDefault();
                  clearCoverageSearch();
                }}
              />
              {coverageSearchQuery ? (
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={clearCoverageSearch}
                  aria-label="Clear coverage search"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {coveragePanelView === "brands" ? (
                <>
                  Showing {sortedBrandCoverageSummaries.length} of{" "}
                  {visibleBrandCoverageSummaries.length}{" "}
                  {visibleBrandCoverageSummaries.length === 1 ? "brand" : "brands"}
                </>
              ) : coveragePanelView === "countries" ? (
                <>
                  Showing {sortedCountryCoverageSummaries.length} of{" "}
                  {visibleUncertainCountryCoverageSummaries.length}{" "}
                  {visibleUncertainCountryCoverageSummaries.length === 1
                    ? "country"
                    : "countries"}
                </>
              ) : (
                <>
                  Showing {sortedRegionCoverageSummaries.length} of{" "}
                  {visibleUncertainRegionCoverageSummaries.length}{" "}
                  {visibleUncertainRegionCoverageSummaries.length === 1
                    ? "region"
                    : "regions"}
                </>
              )}
            </p>
          </div>
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <label className="flex items-start gap-2 text-sm text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                checked={showOnlyUncertainCoverage}
                onChange={(event) =>
                  setShowOnlyUncertainCoverage(event.target.checked)
                }
              />
              <span>{getCoverageFilterToggleLabel(coveragePanelView)}</span>
            </label>
          </div>
          <div className="mt-3">
            <label
              htmlFor="coverage-sort"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Sort rankings
            </label>
            <select
              id="coverage-sort"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              value={coverageSort}
              onChange={(event) => {
                if (isCoverageSort(event.target.value)) {
                  setCoverageSort(event.target.value);
                }
              }}
            >
              <option value="coverage">Coverage strength</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {coveragePanelView === "brands" ? (
            <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
              {sortedBrandCoverageSummaries.length === 0 ? (
                <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                  {getCoverageEmptyStateMessage(
                    coveragePanelView,
                    showOnlyUncertainCoverage,
                    Boolean(coverageSearchQuery.trim()),
                  )}
                </li>
              ) : (
                sortedBrandCoverageSummaries.map((brand) => (
                  <li
                    key={brand.brandName}
                    className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => applyBrandSelection(brand.brandName)}
                        >
                        <p className="text-sm font-medium text-gray-800">
                          {brand.brandName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {brand.confirmedCountryCount} confirmed{" "}
                          {brand.confirmedCountryCount === 1 ? "market" : "markets"}
                          {brand.uncertainCountryCount > 0
                            ? ` · ${brand.uncertainCountryCount} uncertain`
                            : ""}
                        </p>
                      </button>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-700 underline underline-offset-2"
                        aria-label={`Open official website for ${brand.brandName}`}
                      >
                        Website
                      </a>
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : coveragePanelView === "countries" ? (
            <>
              {selectedCoverageRegion ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                  <span>Filtering countries to {selectedCoverageRegion}</span>
                  <button
                    type="button"
                    className="font-medium underline underline-offset-2"
                    onClick={clearCoverageRegion}
                  >
                    Clear region
                  </button>
                </div>
              ) : null}

              <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                {sortedCountryCoverageSummaries.length === 0 ? (
                  <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                    {getCoverageEmptyStateMessage(
                      coveragePanelView,
                      showOnlyUncertainCoverage,
                      Boolean(coverageSearchQuery.trim()),
                    )}
                  </li>
                ) : (
                  sortedCountryCoverageSummaries.map((country) => (
                    <li
                      key={country.isoCode}
                      className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() =>
                          setSelectedCountry({
                            isoCode: country.isoCode,
                            countryName: country.countryName,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {country.countryName}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              {country.isoCode}
                              {countryRegionLookup[country.isoCode]
                                ? ` · ${countryRegionLookup[country.isoCode]}`
                                : ""}
                            </p>
                          </div>
                          <p className="text-right text-xs text-gray-500">
                            {country.confirmedBrandCount} confirmed{" "}
                            {country.confirmedBrandCount === 1 ? "brand" : "brands"}
                            {country.uncertainBrandCount > 0
                              ? ` · ${country.uncertainBrandCount} uncertain`
                              : ""}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {country.brandNames.join(", ")}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
              {sortedRegionCoverageSummaries.length === 0 ? (
                <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                  {getCoverageEmptyStateMessage(
                    coveragePanelView,
                    showOnlyUncertainCoverage,
                    Boolean(coverageSearchQuery.trim()),
                  )}
                </li>
              ) : (
                sortedRegionCoverageSummaries.map((region) => (
                  <li
                    key={region.regionName}
                    className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => {
                          setSelectedCoverageRegion(region.regionName);
                          setCoveragePanelView("countries");
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {region.regionName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {region.confirmedCountryCount} confirmed{" "}
                          {region.confirmedCountryCount === 1
                            ? "country"
                            : "countries"}
                          {region.uncertainCountryCount > 0
                            ? ` · ${region.uncertainCountryCount} uncertain-only`
                            : ""}
                        </p>
                      </button>
                      <p className="text-right text-xs text-gray-500">
                        {region.brandNames.length} tracked{" "}
                        {region.brandNames.length === 1 ? "brand" : "brands"}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {region.brandNames.join(", ")}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}
        </aside>
      ) : null}

      <div className="absolute bottom-6 left-6 bg-white/90 rounded-lg shadow-md px-4 py-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          {activeSelectedBrand ? "Filtered brand presence" : "Chinese EV Brands Present"}
        </h3>
        {activeSelectedBrand || selectedCoverageRegion ? (
          <p className="mb-2 max-w-[12rem] text-xs text-gray-500">
            {activeSelectedBrand && selectedCoverageRegion
              ? selectedBrandHasUncertainPresence
                ? `Highlighting the countries in ${selectedCoverageRegion} where ${activeSelectedBrand} has tracked official presence, with lighter fills for uncertain entries.`
                : `Highlighting the countries in ${selectedCoverageRegion} where ${activeSelectedBrand} has confirmed official presence.`
              : activeSelectedBrand
                ? selectedBrandHasUncertainPresence
                  ? `Highlighting the countries where ${activeSelectedBrand} has tracked official presence, with lighter fills for uncertain entries.`
                  : `Highlighting the countries where ${activeSelectedBrand} has confirmed official presence.`
                : `Highlighting confirmed tracked brand presence within ${selectedCoverageRegion}.`}
          </p>
        ) : null}
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className="w-4 h-4 rounded-sm inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapViewportStatus({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 px-6">
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg shadow-slate-300/30"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
          EVolver map
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
