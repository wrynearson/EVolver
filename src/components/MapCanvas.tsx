import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import type { ExpressionSpecification } from "maplibre-gl";
import type { MapCountrySelection } from "../types";

interface MapCanvasProps {
  countries: FeatureCollection;
  fillColor: ExpressionSpecification | string;
  onHoveredCountryChange: (country: MapCountrySelection | null) => void;
  onSelectedCountryChange: (country: MapCountrySelection | null) => void;
}

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
  onHoveredCountryChange,
  onSelectedCountryChange,
}: MapCanvasProps) {
  return (
    <Map
      initialViewState={{ longitude: 20, latitude: 30, zoom: 1.5 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      interactiveLayerIds={["country-fill"]}
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
        <Layer
          id="country-line"
          type="line"
          paint={{ "line-color": "#627BC1", "line-width": 0.5 }}
        />
      </Source>
    </Map>
  );
}
