import React, { type ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EVPresenceData } from "../src/types";

const mockMap = vi.fn(
  ({
    children,
    onClick,
    onMouseMove,
    onMouseLeave,
  }: {
    children?: ReactNode;
    onClick?: (event: {
      features?: Array<{ properties?: Record<string, unknown> }>;
    }) => void;
    onMouseMove?: (event: {
      features?: Array<{ properties?: Record<string, unknown> }>;
    }) => void;
    onMouseLeave?: () => void;
  }) => (
    <div data-testid="map">
      <button
        type="button"
        onClick={() =>
          onMouseMove?.({
            features: [{ properties: { ISO_A3: "NOR", ADMIN: "Norway" } }],
          })
        }
      >
        Hover Norway
      </button>
      <button
        type="button"
        onClick={() =>
          onMouseMove?.({
            features: [{ properties: { ISO_A3: "SWE", ADMIN: "Sweden" } }],
          })
        }
      >
        Hover Sweden
      </button>
      <button type="button" onClick={() => onMouseLeave?.()}>
        Leave Hover
      </button>
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
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockMap.mockClear();
    mockSource.mockClear();
    mockLayer.mockClear();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the dataset summary overlay, country details, and shareable view state", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState({}, "", "/?brand=XPeng&country=SWE");

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Country lookup")).toBeInTheDocument();
    expect(screen.getByText("Showing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("XPeng")).toBeInTheDocument();
    expect(screen.getByText("Filtered brand presence")).toBeInTheDocument();
    expect(
      screen.getByText("Highlighting the countries where XPeng has confirmed official presence."),
    ).toBeInTheDocument();
    expect(screen.getByText("XPeng present")).toBeInTheDocument();
    expect(screen.queryByText("2-3 brands")).not.toBeInTheDocument();
    expect(screen.getByText("Brands tracked")).toBeInTheDocument();
    expect(screen.getByText("Countries in view")).toBeInTheDocument();
    expect(screen.getByText("2026-03-13")).toBeInTheDocument();

    const xpengRow = screen.getByText("Countries in view").closest("div");
    expect(xpengRow).toHaveTextContent("1");
    expect(window.location.search).toBe("?brand=XPeng&country=SWE");

    const initialDetailsPanel = screen
      .getByRole("heading", { name: "Sweden" })
      .closest("aside");
    expect(initialDetailsPanel).not.toBeNull();
    expect(within(initialDetailsPanel!).getByText("SWE · 0 brands")).toBeInTheDocument();

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

    fireEvent.click(screen.getByRole("button", { name: "Hover Norway" }));
    const previewPanel = screen.getByRole("heading", { name: "Map preview" }).closest(
      "div",
    );
    expect(previewPanel).not.toBeNull();
    expect(within(previewPanel!).getByText("Norway")).toBeInTheDocument();
    expect(within(previewPanel!).getByText("NOR · 1 brand")).toBeInTheDocument();
    expect(within(previewPanel!).getByText("XPeng")).toBeInTheDocument();
    expect(
      within(previewPanel!).getByText(
        "Showing 1 of 2 tracked brands for this country. Clear the brand filter to see the rest.",
      ),
    ).toBeInTheDocument();

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
    expect(
      within(detailsPanel!).getByText(
        "Showing 1 of 2 tracked brands for this country. Clear the brand filter to inspect the rest.",
      ),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng&country=NOR");

    fireEvent.click(screen.getByRole("button", { name: "Copy share link" }));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://localhost:3000/?brand=XPeng&country=NOR",
    );
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute("href", "http://localhost:3000/?brand=XPeng&country=NOR");
    expect(
      await screen.findByRole("button", { name: "Copied share link" }),
    ).toBeInTheDocument();

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
    expect(window.location.search).toBe("?brand=XPeng&country=SWE");

    fireEvent.click(screen.getByRole("button", { name: "Leave Hover" }));
    expect(screen.queryByRole("heading", { name: "Map preview" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByDisplayValue("All brands")).toBeInTheDocument();
    expect(screen.queryByText("Brand footprint")).not.toBeInTheDocument();
    expect(screen.getByText("Chinese EV Brands Present")).toBeInTheDocument();
    expect(screen.getByText("2-3 brands")).toBeInTheDocument();
    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();
    expect(
      within(coveragePanel!).getByText(
        "Compare confirmed official markets across tracked brands.",
      ),
    ).toBeInTheDocument();
    expect(within(coveragePanel!).getByText("BYD")).toBeInTheDocument();
    expect(within(coveragePanel!).getByText("2 confirmed markets")).toBeInTheDocument();
    expect(
      within(coveragePanel!).getByRole("link", {
        name: "Open official website for BYD",
      }),
    ).toHaveAttribute("href", "https://www.byd.com");
    fireEvent.click(within(coveragePanel!).getByRole("button", { name: /BYD/i }));
    expect(screen.getByDisplayValue("BYD")).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE&brand=BYD");
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute("href", "http://localhost:3000/?country=SWE&brand=BYD");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    const refreshedCoveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(refreshedCoveragePanel).not.toBeNull();
    fireEvent.click(
      within(refreshedCoveragePanel!).getByRole("tab", { name: "Countries" }),
    );

    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    expect(
      within(countryCoveragePanel!).getByText(
        "See which countries have the widest confirmed tracked brand coverage.",
      ),
    ).toBeInTheDocument();
    expect(within(countryCoveragePanel!).getByText("Norway")).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("2 confirmed brands"),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("BYD, XPeng"),
    ).toBeInTheDocument();

    fireEvent.click(within(countryCoveragePanel!).getByRole("button", { name: /Norway/i }));

    const allBrandsNorwayPanel = screen
      .getByRole("heading", { name: "Norway" })
      .closest("aside");
    expect(allBrandsNorwayPanel).not.toBeNull();
    expect(
      within(allBrandsNorwayPanel!).getByRole("link", {
        name: "Open official website for XPeng",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com");
    expect(window.location.search).toBe("?country=NOR");

    fireEvent.click(
      within(allBrandsNorwayPanel!).getByRole("button", {
        name: "Show XPeng footprint",
      }),
    );
    expect(screen.getByDisplayValue("XPeng")).toBeInTheDocument();
    expect(window.location.search).toBe("?country=NOR&brand=XPeng");
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
  });

  it("drops invalid brand query params after loading", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState({}, "", "/?brand=Unknown&country=NOR");

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("All brands");
    expect(screen.getByRole("heading", { name: "Brand coverage" })).toBeInTheDocument();
    expect(window.location.search).toBe("?country=NOR");
  });
});
