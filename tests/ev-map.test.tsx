import React, { type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EVPresenceData } from "../src/types";

const mockMap = vi.fn(() => <div data-testid="map" />);
const mockSource = vi.fn(({ children }: { children?: ReactNode }) => (
  <div data-testid="source">{children}</div>
));
const mockLayer = vi.fn(() => <div data-testid="layer" />);

vi.mock("react-map-gl/maplibre", () => ({
  default: mockMap,
  Source: mockSource,
  Layer: mockLayer,
}));

const mockData: EVPresenceData = {
  metadata: {
    last_updated: "2026-03-13",
    definition: "test",
    schema_version: 2,
  },
  brands: {
    BYD: {
      website: "https://www.byd.com",
      countries: {
        CHN: {
          name: "China",
          present: true,
          source: "https://www.byd.com/cn",
          uncertain: false,
        },
      },
    },
    XPeng: {
      website: "https://www.xpeng.com",
      countries: {
        NOR: {
          name: "Norway",
          present: true,
          source: "https://www.xpeng.com/no",
          uncertain: false,
        },
      },
    },
  },
};

const mockGeoJson = {
  type: "FeatureCollection",
  features: [],
};

describe("EVMap", () => {
  beforeEach(() => {
    mockMap.mockClear();
    mockSource.mockClear();
    mockLayer.mockClear();
    vi.restoreAllMocks();
  });

  it("renders the dataset summary overlay once data loads", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toBeInTheDocument();
    expect(screen.getByText("Showing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All brands")).toBeInTheDocument();
    expect(screen.getByText("Brands tracked")).toBeInTheDocument();
    expect(screen.getByText("Countries in view")).toBeInTheDocument();
    expect(screen.getByText("2026-03-13")).toBeInTheDocument();

    const allBrandsRow = screen.getByText("Countries in view").closest("div");
    expect(allBrandsRow).toHaveTextContent("2");

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "BYD" },
    });

    expect(screen.getByDisplayValue("BYD")).toBeInTheDocument();
    const bydRow = screen.getByText("Countries in view").closest("div");
    expect(bydRow).toHaveTextContent("1");
  });
});
