import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  getBrandCoverageSummaries,
  getBrandPresenceCountries,
  getCountryRegionLookup,
  getCountryCoverageSummaries,
  getCountryPresenceDetails,
  getRegionCoverageSummaries,
  normalizeCoverageRegion,
  useEVData,
} from "../hooks/useEVData";
import { buildColorExpression, getLegendItems } from "../lib/mapUtils";
import type { FeatureCollection } from "geojson";
import type { MapCountrySelection } from "../types";

type CopyLinkStatus = "idle" | "copied" | "failed";
type CoveragePanelView = "brands" | "countries" | "regions";
type SelectionState = {
  selectedBrand: string;
  selectedCountry: MapCountrySelection | null;
};
type CountryOption = {
  isoCode: string;
  countryName: string;
  regionName?: string;
};
type CountryLookupMatch = CountryOption;

const MapCanvas = lazy(() => import("./MapCanvas"));

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

function getSelectionStateFromSearch(search: string): SelectionState {
  const searchParams = new URLSearchParams(search);
  const selectedBrand = searchParams.get("brand")?.trim() ?? "";
  const selectedCountryIsoCode = normalizeIsoCode(searchParams.get("country"));

  return {
    selectedBrand,
    selectedCountry: selectedCountryIsoCode
      ? { isoCode: selectedCountryIsoCode }
      : null,
  };
}

function getInitialSelectionState(): SelectionState {
  if (typeof window === "undefined") {
    return {
      selectedBrand: "",
      selectedCountry: null,
    };
  }

  return getSelectionStateFromSearch(window.location.search);
}

function buildShareUrl(
  selectedBrand: string,
  selectedCountry: MapCountrySelection | null,
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
  const { data, countryBrandCount, summary, loading } = useEVData();
  const [countries, setCountries] = useState<FeatureCollection | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    () => getInitialSelectionState().selectedBrand,
  );
  const [hoveredCountry, setHoveredCountry] = useState<MapCountrySelection | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<MapCountrySelection | null>(
    () => getInitialSelectionState().selectedCountry,
  );
  const [copyLinkStatus, setCopyLinkStatus] = useState<CopyLinkStatus>("idle");
  const [coveragePanelView, setCoveragePanelView] =
    useState<CoveragePanelView>("brands");
  const [coverageSearchQuery, setCoverageSearchQuery] = useState("");
  const [selectedCoverageRegion, setSelectedCoverageRegion] = useState("");
  const [footprintSearchQuery, setFootprintSearchQuery] = useState("");
  const [countryLookupQuery, setCountryLookupQuery] = useState(() =>
    getCountryLookupValue(getInitialSelectionState().selectedCountry),
  );
  const activeSelectedBrand =
    data && selectedBrand && !data.brands[selectedBrand] ? "" : selectedBrand;

  const brandOptions = useMemo(
    () => (data ? Object.keys(data.brands).sort((a, b) => a.localeCompare(b)) : []),
    [data],
  );

  const visibleCountryBrandCount = useMemo(() => {
    if (!data) {
      return countryBrandCount;
    }

    return computeCountryBrandCounts(data, activeSelectedBrand || undefined);
  }, [activeSelectedBrand, countryBrandCount, data]);

  const visibleSummary = useMemo(() => {
    if (!data) {
      return summary;
    }

    return computeDatasetSummary(data, activeSelectedBrand || undefined);
  }, [activeSelectedBrand, data, summary]);

  const countryOptions = useMemo<CountryOption[]>(() => {
    if (!countries) {
      return [];
    }

    return countries.features
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
  }, [countries]);

  const countryRegionLookup = useMemo(
    () => (countries ? getCountryRegionLookup(countries) : {}),
    [countries],
  );

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

  const shouldShowCountryLookupMatches =
    countryLookupQuery.trim().length > 0 &&
    (!exactCountryLookupMatch ||
      exactCountryLookupMatch.isoCode !== resolvedSelectedCountry?.isoCode);

  const selectedCountryDetails = useMemo(() => {
    if (!data || !resolvedSelectedCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        data,
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
  }, [activeSelectedBrand, data, resolvedSelectedCountry]);

  const allSelectedCountryDetails = useMemo(() => {
    if (!data || !resolvedSelectedCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        data,
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
  }, [data, resolvedSelectedCountry]);

  const hoveredCountryDetails = useMemo(() => {
    if (!data || !resolvedHoveredCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        data,
        resolvedHoveredCountry.isoCode,
        activeSelectedBrand || undefined,
        resolvedHoveredCountry.countryName,
      ) ?? {
        isoCode: resolvedHoveredCountry.isoCode,
        countryName: resolvedHoveredCountry.countryName ?? resolvedHoveredCountry.isoCode,
        brands: [],
      }
    );
  }, [activeSelectedBrand, data, resolvedHoveredCountry]);

  const allHoveredCountryDetails = useMemo(() => {
    if (!data || !resolvedHoveredCountry) {
      return null;
    }

    return (
      getCountryPresenceDetails(
        data,
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
  }, [data, resolvedHoveredCountry]);

  const selectedBrandPresence = useMemo(() => {
    if (!data || !activeSelectedBrand) {
      return [];
    }

    return getBrandPresenceCountries(data, activeSelectedBrand);
  }, [activeSelectedBrand, data]);

  const filteredSelectedBrandPresence = useMemo(
    () =>
      selectedBrandPresence.filter((country) =>
        matchesSearchQuery(
          [country.countryName, country.isoCode],
          footprintSearchQuery,
        ),
      ),
    [footprintSearchQuery, selectedBrandPresence],
  );

  const brandCoverageSummaries = useMemo(() => {
    if (!data || activeSelectedBrand) {
      return [];
    }

    return getBrandCoverageSummaries(data);
  }, [activeSelectedBrand, data]);

  const countryCoverageSummaries = useMemo(() => {
    if (!data || activeSelectedBrand) {
      return [];
    }

    return getCountryCoverageSummaries(data);
  }, [activeSelectedBrand, data]);

  const regionCoverageSummaries = useMemo(() => {
    if (!data || activeSelectedBrand) {
      return [];
    }

    return getRegionCoverageSummaries(data, countryRegionLookup);
  }, [activeSelectedBrand, countryRegionLookup, data]);

  const visibleCountryCoverageSummaries = useMemo(
    () =>
      countryCoverageSummaries.filter(
        (country) =>
          !selectedCoverageRegion ||
          countryRegionLookup[country.isoCode] === selectedCoverageRegion,
      ),
    [countryCoverageSummaries, countryRegionLookup, selectedCoverageRegion],
  );

  const filteredBrandCoverageSummaries = useMemo(
    () =>
      brandCoverageSummaries.filter((brand) =>
        matchesSearchQuery([brand.brandName], coverageSearchQuery),
      ),
    [brandCoverageSummaries, coverageSearchQuery],
  );

  const filteredCountryCoverageSummaries = useMemo(
    () =>
      visibleCountryCoverageSummaries.filter((country) =>
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
    [coverageSearchQuery, countryRegionLookup, visibleCountryCoverageSummaries],
  );

  const filteredRegionCoverageSummaries = useMemo(
    () =>
      regionCoverageSummaries.filter((region) =>
        matchesSearchQuery(
          [region.regionName, region.brandNames.join(" ")],
          coverageSearchQuery,
        ),
      ),
    [coverageSearchQuery, regionCoverageSummaries],
  );

  const shareUrl = useMemo(
    () => buildShareUrl(activeSelectedBrand, resolvedSelectedCountry),
    [activeSelectedBrand, resolvedSelectedCountry],
  );
  const legendItems = useMemo(
    () => getLegendItems(activeSelectedBrand || undefined),
    [activeSelectedBrand],
  );

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/ne_110m_countries.geojson")
      .then((res) => res.json())
      .then(setCountries)
      .catch((err) =>
        console.error("Failed to load country boundaries:", err),
      );
  }, []);

  useEffect(() => {
    if (!data || !selectedBrand || data.brands[selectedBrand]) {
      return;
    }

    setSelectedBrand("");
  }, [data, selectedBrand]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      const nextState = getSelectionStateFromSearch(window.location.search);

      setSelectedBrand(nextState.selectedBrand);
      setSelectedCountry(nextState.selectedCountry);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const currentBrand = url.searchParams.get("brand")?.trim() ?? "";
    const currentCountry = normalizeIsoCode(url.searchParams.get("country"));

    if (
      currentBrand === activeSelectedBrand &&
      currentCountry === resolvedSelectedCountry?.isoCode
    ) {
      return;
    }

    const nextUrl = buildShareUrl(activeSelectedBrand, resolvedSelectedCountry);
    window.history.replaceState({}, "", nextUrl);
  }, [activeSelectedBrand, resolvedSelectedCountry]);

  useEffect(() => {
    setCopyLinkStatus("idle");
  }, [activeSelectedBrand, resolvedSelectedCountry]);

  useEffect(() => {
    setCoverageSearchQuery("");
  }, [activeSelectedBrand, coveragePanelView]);

  useEffect(() => {
    setFootprintSearchQuery("");
  }, [activeSelectedBrand]);

  useEffect(() => {
    setCountryLookupQuery(getCountryLookupValue(resolvedSelectedCountry));
  }, [resolvedSelectedCountry]);

  useEffect(() => {
    if (!activeSelectedBrand) {
      return;
    }

    setSelectedCoverageRegion("");
  }, [activeSelectedBrand]);

  useEffect(() => {
    if (
      !selectedCoverageRegion ||
      regionCoverageSummaries.some(
        (region) => region.regionName === selectedCoverageRegion,
      )
    ) {
      return;
    }

    setSelectedCoverageRegion("");
  }, [regionCoverageSummaries, selectedCoverageRegion]);

  const fillColor = buildColorExpression(visibleCountryBrandCount);
  const mapStatus = loading
    ? {
        title: "Loading verified EV data",
        description:
          "Fetching the latest confirmed market presence before rendering the map.",
      }
    : !data
      ? {
          title: "Map data unavailable",
          description:
            "The verified EV presence dataset could not be loaded for this session.",
        }
      : !countries
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
        {data && countries ? (
          <Suspense
            fallback={
              <MapViewportStatus
                title={mapStatus.title}
                description={mapStatus.description}
              />
            }
          >
            <MapCanvas
              countries={countries}
              fillColor={fillColor}
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
            <select
              id="brand-filter"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              value={activeSelectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
            >
              <option value="">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
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
                />
                {countryLookupQuery || resolvedSelectedCountry ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setCountryLookupQuery("");
                      setSelectedCountry(null);
                    }}
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
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {filteredCountryOptions.map((country) => (
                        <li key={country.isoCode}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                            onClick={() => {
                              setSelectedCountry({
                                isoCode: country.isoCode,
                                countryName: country.countryName,
                              });
                            }}
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
          <div className="mt-3">
            <button
              type="button"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                if (!shareUrl || !navigator.clipboard?.writeText) {
                  setCopyLinkStatus("failed");
                  return;
                }

                void navigator.clipboard.writeText(shareUrl).then(
                  () => setCopyLinkStatus("copied"),
                  () => setCopyLinkStatus("failed"),
                );
              }}
            >
              {copyLinkStatus === "copied"
                ? "Copied share link"
                : copyLinkStatus === "failed"
                  ? "Copy failed"
                  : "Copy share link"}
            </button>
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
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Showing</dt>
              <dd className="font-medium text-gray-800">
                {visibleSummary.visibleBrandLabel}
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
        </div>
      ) : null}

      {hoveredCountryDetails ? (
        <div className="pointer-events-none absolute top-6 left-1/2 z-10 w-full max-w-xs -translate-x-1/2 px-4">
          <div className="rounded-lg bg-white/95 px-4 py-3 shadow-md">
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
            <p className="mt-2 text-xs text-gray-600">
              {hoveredCountryDetails.brands.length > 0
                ? hoveredCountryDetails.brands
                    .map((brand) => brand.brandName)
                    .join(", ")
                : "No tracked official brand presence for this country in the current view."}
            </p>
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
        <aside className="absolute top-6 right-6 max-w-sm rounded-lg bg-white/95 px-4 py-3 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                {selectedCountryDetails.countryName}
              </h2>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {selectedCountryDetails.isoCode} · {selectedCountryDetails.brands.length}{" "}
                {selectedCountryDetails.brands.length === 1 ? "brand" : "brands"}
              </p>
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
              <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                No tracked official brand presence for this country in the current
                view.
              </li>
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
                          onClick={() => setSelectedBrand(brand.brandName)}
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
                      </div>
                    </div>
                    {brand.uncertain ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Uncertain
                      </span>
                    ) : null}
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
        <aside className="absolute right-6 bottom-6 max-h-80 w-80 overflow-hidden rounded-lg bg-white/95 px-4 py-3 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Brand footprint
              </h2>
              <p className="text-xs text-gray-500">
                {activeSelectedBrand} · {selectedBrandPresence.length}{" "}
                {selectedBrandPresence.length === 1 ? "market" : "markets"}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedBrand("")}
            >
              Clear
            </button>
          </div>

          <div className="mt-3">
            <label
              htmlFor="brand-footprint-search"
              className="block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Search footprint markets
            </label>
            <input
              id="brand-footprint-search"
              type="search"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              placeholder="Filter by country or ISO code"
              value={footprintSearchQuery}
              onChange={(event) => setFootprintSearchQuery(event.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Showing {filteredSelectedBrandPresence.length} of{" "}
              {selectedBrandPresence.length}{" "}
              {selectedBrandPresence.length === 1 ? "market" : "markets"}
            </p>
          </div>

          <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
            {filteredSelectedBrandPresence.length === 0 ? (
              <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                No markets match this filter.
              </li>
            ) : (
              filteredSelectedBrandPresence.map((country) => (
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
                      </p>
                    </button>
                    {country.uncertain ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Uncertain
                      </span>
                    ) : null}
                  </div>
                  {country.source ? (
                    <a
                      href={country.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-xs text-blue-700 underline underline-offset-2"
                      aria-label={`Open official source for ${country.countryName}`}
                    >
                      Official source
                    </a>
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
            </div>

          <div
            className="mt-3 inline-flex rounded-md border border-gray-200 bg-gray-50 p-1"
            role="tablist"
            aria-label="Coverage ranking view"
          >
            {(["brands", "countries", "regions"] as const).map((view) => {
              const isActive = coveragePanelView === view;

              return (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    isActive
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setCoveragePanelView(view)}
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
            <input
              id="coverage-search"
              type="search"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              placeholder={
                coveragePanelView === "brands"
                  ? "Filter by brand name"
                  : coveragePanelView === "countries"
                    ? "Filter by country, ISO code, region, or brand"
                    : "Filter by region or active brand"
              }
              value={coverageSearchQuery}
              onChange={(event) => setCoverageSearchQuery(event.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              {coveragePanelView === "brands" ? (
                <>
                  Showing {filteredBrandCoverageSummaries.length} of{" "}
                  {brandCoverageSummaries.length}{" "}
                  {brandCoverageSummaries.length === 1 ? "brand" : "brands"}
                </>
              ) : coveragePanelView === "countries" ? (
                <>
                  Showing {filteredCountryCoverageSummaries.length} of{" "}
                  {visibleCountryCoverageSummaries.length}{" "}
                  {visibleCountryCoverageSummaries.length === 1
                    ? "country"
                    : "countries"}
                </>
              ) : (
                <>
                  Showing {filteredRegionCoverageSummaries.length} of{" "}
                  {regionCoverageSummaries.length}{" "}
                  {regionCoverageSummaries.length === 1 ? "region" : "regions"}
                </>
              )}
            </p>
          </div>

          {coveragePanelView === "brands" ? (
            <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
              {filteredBrandCoverageSummaries.length === 0 ? (
                <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                  No brands match this filter.
                </li>
              ) : (
                filteredBrandCoverageSummaries.map((brand) => (
                  <li
                    key={brand.brandName}
                    className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => setSelectedBrand(brand.brandName)}
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
                    onClick={() => setSelectedCoverageRegion("")}
                  >
                    Clear region
                  </button>
                </div>
              ) : null}

              <ul className="mt-3 max-h-48 space-y-3 overflow-y-auto pr-1">
                {filteredCountryCoverageSummaries.length === 0 ? (
                  <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                    No countries match this filter.
                  </li>
                ) : (
                  filteredCountryCoverageSummaries.map((country) => (
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
              {filteredRegionCoverageSummaries.length === 0 ? (
                <li className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                  No regions match this filter.
                </li>
              ) : (
                filteredRegionCoverageSummaries.map((region) => (
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
        {activeSelectedBrand ? (
          <p className="mb-2 max-w-[12rem] text-xs text-gray-500">
            Highlighting the countries where {activeSelectedBrand} has confirmed official
            presence.
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
