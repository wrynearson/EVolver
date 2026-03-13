import { useEffect, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEVData } from "../hooks/useEVData";
import { buildColorExpression, LEGEND_ITEMS } from "../lib/mapUtils";
import type { FeatureCollection } from "geojson";

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
  const { countryBrandCount, summary, loading } = useEVData();
  const [countries, setCountries] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/ne_110m_countries.geojson")
      .then((res) => res.json())
      .then(setCountries)
      .catch((err) =>
        console.error("Failed to load country boundaries:", err),
      );
  }, []);

  if (loading || !countries) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fillColor = buildColorExpression(countryBrandCount) as any;

  return (
    <div className="w-screen h-screen relative">
      <Map
        initialViewState={{ longitude: 20, latitude: 30, zoom: 1.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
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

      {summary ? (
        <div className="absolute top-6 left-6 bg-white/90 rounded-lg shadow-md px-4 py-3 max-w-xs">
          <h2 className="text-sm font-semibold text-gray-800">
            Dataset summary
          </h2>
          <dl className="mt-2 space-y-1 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Brands tracked</dt>
              <dd className="font-medium text-gray-800">{summary.brandCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Countries with confirmed presence</dt>
              <dd className="font-medium text-gray-800">
                {summary.confirmedCountryCount}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Last updated</dt>
              <dd className="font-medium text-gray-800">
                {summary.lastUpdated}
              </dd>
            </div>
          </dl>
        </div>
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
