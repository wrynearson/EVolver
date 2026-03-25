import React, { type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EVPresenceData } from "../src/types";

const mockMap = vi.fn(
  ({
    children,
    onClick,
  }: {
    children?: ReactNode;
    onClick?: (event: {
      features?: Array<{ properties?: Record<string, unknown> }>;
    }) => void;
  }) => (
    <div data-testid="map">
      <button
        type="button"
        onClick={() =>
          onClick?.({
            features: [{ properties: { ISO_A3: "NOR", ADMIN: "Norway" } }],
          })
        }
      >
        Select Norway
      </button>
      <button
        type="button"
        onClick={() =>
          onClick?.({
            features: [{ properties: { ISO_A3: "SWE", ADMIN: "Sweden" } }],
          })
        }
      >
        Select Sweden
      </button>
      {children}
    </div>
  ),
);
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
        NOR: {
          name: "Norway",
          present: true,
          source: "https://www.byd.com/no",
          sources: ["https://www.byd.com/no", "https://www.byd.com/no/dealers"],
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
          sources: ["https://www.xpeng.com/no"],
          uncertain: false,
        },
      },
    },
  },
};

const mockGeoJson = {
  type: "FeatureCollection",
  features: [
    { properties: { ISO_A3: "NOR", ADMIN: "Norway" } },
    { properties: { ISO_A3: "SWE", ADMIN: "Sweden" } },
  ],
};

describe("EVMap", () => {
  beforeEach(() => {
    mockMap.mockClear();
    mockSource.mockClear();
    mockLayer.mockClear();
    vi.restoreAllMocks();
  });

  it("renders the dataset summary overlay and country details once data loads", async () => {
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
    expect(screen.getByLabelText("Country lookup")).toBeInTheDocument();
    expect(screen.getByText("Showing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("All brands")).toBeInTheDocument();
    expect(screen.getByText("Brands tracked")).toBeInTheDocument();
    expect(screen.getByText("Countries in view")).toBeInTheDocument();
    expect(screen.getByText("2026-03-13")).toBeInTheDocument();

    const allBrandsRow = screen.getByText("Countries in view").closest("div");
    expect(allBrandsRow).toHaveTextContent("2");

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "XPeng" },
    });

    expect(screen.getByDisplayValue("XPeng")).toBeInTheDocument();
    const xpengRow = screen.getByText("Countries in view").closest("div");
    expect(xpengRow).toHaveTextContent("1");
    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(within(footprintPanel!).getByText("XPeng · 1 market")).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("link", {
        name: "Open official source for Norway",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com/no");

    fireEvent.click(within(footprintPanel!).getByRole("button", { name: /Norway/i }));

    const detailsPanel = screen.getByRole("heading", { name: "Norway" }).closest(
      "aside",
    );
    expect(detailsPanel).not.toBeNull();
    expect(within(detailsPanel!).getByText("NOR · 1 brand")).toBeInTheDocument();
    expect(within(detailsPanel!).getByText("XPeng")).toBeInTheDocument();
    expect(
      within(detailsPanel!).getByRole("link", { name: "https://www.xpeng.com/no" }),
    ).toHaveAttribute("href", "https://www.xpeng.com/no");

    fireEvent.change(screen.getByLabelText("Country lookup"), {
      target: { value: "SWE" },
    });

    const emptyDetailsPanel = screen.getByRole("heading", { name: "Sweden" }).closest(
      "aside",
    );
    expect(emptyDetailsPanel).not.toBeNull();
    expect(within(emptyDetailsPanel!).getByText("SWE · 0 brands")).toBeInTheDocument();
    expect(
      within(emptyDetailsPanel!).getByText(
        "No tracked official brand presence for this country in the current view.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByDisplayValue("All brands")).toBeInTheDocument();
    expect(screen.queryByText("Brand footprint")).not.toBeInTheDocument();
  });
});
