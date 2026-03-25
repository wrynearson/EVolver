import { useEffect, useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  computeCountryBrandCounts,
  computeDatasetSummary,
  getBrandPresenceCountries,
  getCountryPresenceDetails,
  useEVData,
} from "../hooks/useEVData";
import { buildColorExpression, LEGEND_ITEMS } from "../lib/mapUtils";
import type { FeatureCollection } from "geojson";

type SelectedCountry = {
  isoCode: string;
  countryName?: string;
};

type CopyLinkStatus = "idle" | "copied" | "failed";

function normalizeIsoCode(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalizedValue) ? normalizedValue : null;
}

function getInitialSelectionState(): {
  selectedBrand: string;
  selectedCountry: SelectedCountry | null;
} {
  if (typeof window === "undefined") {
    return {
      selectedBrand: "",
      selectedCountry: null,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const selectedBrand = searchParams.get("brand")?.trim() ?? "";
  const selectedCountryIsoCode = normalizeIsoCode(searchParams.get("country"));

  return {
    selectedBrand,
    selectedCountry: selectedCountryIsoCode
      ? { isoCode: selectedCountryIsoCode }
      : null,
  };
}

function buildShareUrl(selectedBrand: string, selectedCountry: SelectedCountry | null) {
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
  const [hoveredCountry, setHoveredCountry] = useState<SelectedCountry | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(
    () => getInitialSelectionState().selectedCountry,
  );
  const [copyLinkStatus, setCopyLinkStatus] = useState<CopyLinkStatus>("idle");
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

  const countryOptions = useMemo(() => {
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

        return [{ isoCode, countryName }];
      })
      .sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, [countries]);

  const resolvedSelectedCountry = useMemo(() => {
    const resolveCountrySelection = (country: SelectedCountry | null) => {
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

  const selectedBrandPresence = useMemo(() => {
    if (!data || !activeSelectedBrand) {
      return [];
    }

    return getBrandPresenceCountries(data, activeSelectedBrand);
  }, [activeSelectedBrand, data]);

  const shareUrl = useMemo(
    () => buildShareUrl(activeSelectedBrand, resolvedSelectedCountry),
    [activeSelectedBrand, resolvedSelectedCountry],
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

  if (loading || !countries) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fillColor = buildColorExpression(visibleCountryBrandCount) as any;

  return (
    <div className="w-screen h-screen relative">
      <Map
        initialViewState={{ longitude: 20, latitude: 30, zoom: 1.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        interactiveLayerIds={["country-fill"]}
        onMouseMove={(event) => {
          const hoveredFeature = event.features?.[0];
          const properties = hoveredFeature?.properties;
          const isoCode =
            typeof properties?.ISO_A3 === "string" ? properties.ISO_A3 : null;

          if (!isoCode || isoCode === "-99") {
            setHoveredCountry(null);
            return;
          }

          const countryName =
            typeof properties?.ADMIN === "string"
              ? properties.ADMIN
              : typeof properties?.NAME === "string"
                ? properties.NAME
                : undefined;

          setHoveredCountry({ isoCode, countryName });
        }}
        onMouseLeave={() => setHoveredCountry(null)}
        onClick={(event) => {
          const clickedFeature = event.features?.[0];
          const properties = clickedFeature?.properties;
          const isoCode =
            typeof properties?.ISO_A3 === "string" ? properties.ISO_A3 : null;

          if (!isoCode || isoCode === "-99") {
            setSelectedCountry(null);
            return;
          }

          const countryName =
            typeof properties?.ADMIN === "string"
              ? properties.ADMIN
              : typeof properties?.NAME === "string"
                ? properties.NAME
                : undefined;

          setSelectedCountry({ isoCode, countryName });
        }}
      >
        <Source id="countries" type="geojson" data={countries}>
          <Layer
            id="country-fill"
            type="fill"
            paint={{ "fill-color": fillColor, "fill-opacity": 0.7 }}
          />
          <Layer
            id="country-line"
            type="line"
            paint={{ "line-color": "#627BC1", "line-width": 0.5 }}
          />
        </Source>
      </Map>

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
            <select
              id="country-filter"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              value={resolvedSelectedCountry?.isoCode ?? ""}
              onChange={(event) => {
                const isoCode = event.target.value;

                if (!isoCode) {
                  setSelectedCountry(null);
                  return;
                }

                const option = countryOptions.find(
                  (country) => country.isoCode === isoCode,
                );
                setSelectedCountry({
                  isoCode,
                  countryName: option?.countryName ?? isoCode,
                });
              }}
            >
              <option value="">Select a country</option>
              {countryOptions.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.countryName}
                </option>
              ))}
            </select>
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
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-800">
                      {brand.brandName}
                    </p>
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

          <ul className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
            {selectedBrandPresence.map((country) => (
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
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="absolute bottom-6 left-6 bg-white/90 rounded-lg shadow-md px-4 py-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          Chinese EV Brands Present
        </h3>
        {LEGEND_ITEMS.map((item) => (
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
