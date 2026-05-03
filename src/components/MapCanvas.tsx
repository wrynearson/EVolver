import { useEffect, useMemo, useRef } from "react";
import Map, { Layer, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import type { ExpressionSpecification } from "maplibre-gl";
import type { MapBounds } from "../lib/mapUtils";
import type { MapCountrySelection } from "../types";

interface MapCanvasProps {
  countries: FeatureCollection;
  fillColor: ExpressionSpecification | string;
  focusBounds: MapBounds | null;
  focusTargetKey: string;
  hoveredCountryIsoCode: string | null;
  uncertainCountryIsoCodes?: Iterable<string>;
  onHoveredCountryChange: (country: MapCountrySelection | null) => void;
  onSelectedCountryChange: (country: MapCountrySelection | null) => void;
}

const DEFAULT_VIEW_STATE = { longitude: 20, latitude: 30, zoom: 1.5 };

function getCountrySelection(
  properties: Record<string, unknown> | undefined,
): MapCountrySelection | null {
  const isoCode = typeof properties?.ISO_A3 === "string" ? properties.ISO_A3 : null;

  if (!isoCode || isoCode === "-99") {
    return null;
  }

  const countryName =
    typeof properties?.ADMIN === "string"
      ? properties.ADMIN
      : typeof properties?.NAME === "string"
        ? properties.NAME
        : undefined;

  return { isoCode, countryName };
}

export default function MapCanvas({
  countries,
  fillColor,
  focusBounds,
  focusTargetKey,
  hoveredCountryIsoCode,
  uncertainCountryIsoCodes,
  onHoveredCountryChange,
  onSelectedCountryChange,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);
  const resolvedUncertainCountryIsoCodes = useMemo(
    () => Array.from(new Set(uncertainCountryIsoCodes ?? [])),
    [uncertainCountryIsoCodes],
  );
  const interactiveLayerIds = useMemo(
    () =>
      resolvedUncertainCountryIsoCodes.length > 0
        ? ["country-fill", "country-uncertain-line"]
        : ["country-fill"],
    [resolvedUncertainCountryIsoCodes],
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();

    if (!map) {
      return;
    }

    if (focusBounds) {
      map.fitBounds(focusBounds, {
        padding: 64,
        duration: 600,
        maxZoom: 5,
      });
      return;
    }

    map.easeTo({
      center: [DEFAULT_VIEW_STATE.longitude, DEFAULT_VIEW_STATE.latitude],
      zoom: DEFAULT_VIEW_STATE.zoom,
      duration: 600,
    });
  }, [focusBounds, focusTargetKey]);

  return (
    <Map
      ref={mapRef}
      initialViewState={DEFAULT_VIEW_STATE}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      interactiveLayerIds={interactiveLayerIds}
      onMouseMove={(event) =>
        onHoveredCountryChange(getCountrySelection(event.features?.[0]?.properties))
      }
      onMouseLeave={() => onHoveredCountryChange(null)}
      onClick={(event) =>
        onSelectedCountryChange(getCountrySelection(event.features?.[0]?.properties))
      }
    >
      <Source id="countries" type="geojson" data={countries}>
        <Layer
          id="country-fill"
          type="fill"
          paint={{ "fill-color": fillColor, "fill-opacity": 0.7 }}
        />
        {resolvedUncertainCountryIsoCodes.length > 0 ? (
          <Layer
            id="country-uncertain-line"
            type="line"
            filter={["in", "ISO_A3", ...resolvedUncertainCountryIsoCodes]}
            paint={{
              "line-color": "#f59e0b",
              "line-width": 1.75,
              "line-dasharray": [2, 1],
              "line-opacity": 0.95,
            }}
          />
        ) : null}
        <Layer
          id="country-line"
          type="line"
          paint={{ "line-color": "#627BC1", "line-width": 0.5 }}
        />
        {hoveredCountryIsoCode ? (
          <Layer
            id="country-hover-line"
            type="line"
            filter={["==", ["get", "ISO_A3"], hoveredCountryIsoCode]}
            paint={{
              "line-color": "#1d4ed8",
              "line-width": 2,
              "line-opacity": 0.95,
            }}
          />
        ) : null}
      </Source>
    </Map>
  );
}
