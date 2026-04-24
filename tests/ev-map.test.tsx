import React, { type ReactNode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EVPresenceData } from "../src/types";

const mockMap = vi.fn();
const mockFitBounds = vi.fn();
const mockEaseTo = vi.fn();
const MockMapComponent = React.forwardRef(
  (
    {
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
    },
    ref: React.ForwardedRef<{
      getMap: () => { fitBounds: typeof mockFitBounds; easeTo: typeof mockEaseTo };
    }>,
  ) => {
    React.useImperativeHandle(ref, () => ({
      getMap: () => ({
        fitBounds: mockFitBounds,
        easeTo: mockEaseTo,
      }),
    }));
    mockMap({ children, onClick, onMouseMove, onMouseLeave });

    return (
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
    );
  },
);
const mockSource = vi.fn(({ children }: { children?: ReactNode }) => (
  <div data-testid="source">{children}</div>
));
const mockLayer = vi.fn(() => <div data-testid="layer" />);

vi.mock("react-map-gl/maplibre", () => ({
  default: MockMapComponent,
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
          sources: ["https://www.xpeng.com/no", "https://www.xpeng.com/no/service"],
          uncertain: false,
        },
      },
    },
  },
};

const mockUncertainData: EVPresenceData = {
  ...mockData,
  brands: {
    ...mockData.brands,
    BYD: {
      ...mockData.brands.BYD,
      countries: {
        ...mockData.brands.BYD.countries,
        NOR: {
          ...mockData.brands.BYD.countries.NOR,
          uncertain: true,
        },
      },
    },
  },
};

const mockGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        ISO_A3: "SWE",
        ADMIN: "Sweden",
        REGION_UN: "Europe",
        CONTINENT: "Europe",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [11, 55],
            [24, 55],
            [24, 69],
            [11, 69],
            [11, 55],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "NOR",
        ADMIN: "Norway",
        REGION_UN: "Europe",
        CONTINENT: "Europe",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5, 58],
            [11, 58],
            [11, 71],
            [5, 71],
            [5, 58],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "CHN",
        ADMIN: "China",
        REGION_UN: "Asia",
        CONTINENT: "Asia",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73, 18],
            [135, 18],
            [135, 53],
            [73, 53],
            [73, 18],
          ],
        ],
      },
    },
  ],
};

describe("EVMap", () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.clearAllMocks();
    vi.doUnmock("../src/components/MapCanvas");
  });

  beforeEach(() => {
    mockMap.mockClear();
    mockSource.mockClear();
    mockLayer.mockClear();
    mockFitBounds.mockClear();
    mockEaseTo.mockClear();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("exports the currently filtered dataset as csv and json", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const downloadTextFile = vi.fn();
    vi.doMock("../src/lib/dataExport", async () => {
      const actual = await vi.importActual<typeof import("../src/lib/dataExport")>(
        "../src/lib/dataExport",
      );

      return {
        ...actual,
        downloadTextFile,
      };
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download CSV" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download JSON" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy all sources in view" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "XPeng" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));

    expect(downloadTextFile).toHaveBeenCalledTimes(1);
    expect(downloadTextFile).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      "ev-presence-xpeng-all-regions-2026-03-13.csv",
      "text/csv;charset=utf-8",
    );
    expect(downloadTextFile.mock.calls[0][0]).toContain(
      "XPeng,https://www.xpeng.com,NOR,Norway,Europe,true,false,https://www.xpeng.com/no,https://www.xpeng.com/no",
    );
    expect(downloadTextFile.mock.calls[0][0]).not.toContain("BYD");
    fireEvent.click(screen.getByRole("button", { name: "Copy all sources in view" }));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://www.xpeng.com/no\nhttps://www.xpeng.com/no/service",
    );
    expect(
      await screen.findByRole("button", { name: "Copied all sources in view" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Region filter"), {
      target: { value: "Europe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Download JSON" }));

    expect(downloadTextFile).toHaveBeenCalledTimes(2);
    expect(downloadTextFile).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      "ev-presence-all-brands-europe-2026-03-13.json",
      "application/json;charset=utf-8",
    );

    const exportedJson = JSON.parse(downloadTextFile.mock.calls[1][0]) as EVPresenceData;
    expect(Object.keys(exportedJson.brands)).toEqual(["BYD", "XPeng"]);
    expect(Object.keys(exportedJson.brands.BYD.countries)).toEqual(["NOR"]);
    expect(Object.keys(exportedJson.brands.XPeng.countries)).toEqual(["NOR"]);
    fireEvent.click(screen.getByRole("button", { name: "Copy all sources in view" }));
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      [
        "https://www.byd.com/no",
        "https://www.byd.com/no/dealers",
        "https://www.xpeng.com/no",
        "https://www.xpeng.com/no/service",
      ].join("\n"),
    );
  });

  it("keeps the data panels available while the map canvas chunk is still loading", async () => {
    vi.doMock(
      "../src/components/MapCanvas",
      () =>
        new Promise(() => {
          // Keep the lazy map canvas pending so EVMap renders its in-place loading shell.
        }),
    );
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
    expect(screen.getByLabelText("Region filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Country lookup")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading interactive map");
    expect(
      screen.getByText(
        "The data panels are ready while the interactive MapLibre canvas finishes loading.",
      ),
    ).toBeInTheDocument();
  });

  it("fits the map to a selected country", async () => {
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
    expect(await screen.findByTestId("map")).toBeInTheDocument();
    mockFitBounds.mockClear();
    mockEaseTo.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Select Norway" }));

    await waitFor(() =>
      expect(mockFitBounds).toHaveBeenCalledWith(
        [
          [5, 58],
          [11, 71],
        ],
        expect.objectContaining({
          duration: 600,
          maxZoom: 5,
          padding: 64,
        }),
      ),
    );
  });

  it("fits the map to the active region filter", async () => {
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
    expect(await screen.findByTestId("map")).toBeInTheDocument();
    mockFitBounds.mockClear();
    mockEaseTo.mockClear();

    fireEvent.change(screen.getByLabelText("Region filter"), {
      target: { value: "Europe" },
    });

    await waitFor(() =>
      expect(mockFitBounds).toHaveBeenCalledWith(
        [
          [5, 55],
          [24, 71],
        ],
        expect.objectContaining({
          duration: 600,
          maxZoom: 5,
          padding: 64,
        }),
      ),
    );
  });

  it("clears the top-level region filter in one click", async () => {
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

    fireEvent.change(screen.getByLabelText("Region filter"), {
      target: { value: "Europe" },
    });

    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("Europe");
    expect(screen.getByRole("button", { name: "Clear region filter" })).toBeInTheDocument();
    expect(window.location.search).toBe("?view=brands&region=Europe");

    fireEvent.click(screen.getByRole("button", { name: "Clear region filter" }));

    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("All regions");
    expect(
      screen.queryByRole("button", { name: "Clear region filter" }),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("surfaces active view filters and clears them one by one", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState(
      {},
      "",
      "/?brand=XPeng&country=SWE&view=brands&region=Europe&coverageSort=name&footprintSort=name-desc&footprintQuery=nor",
    );

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(screen.getByText("Active view")).toBeInTheDocument();
    expect(screen.getByText("Brand: XPeng")).toBeInTheDocument();
    expect(screen.getByText("Region: Europe")).toBeInTheDocument();
    expect(screen.getByText("Country: Sweden (SWE)")).toBeInTheDocument();
    expect(screen.getByText("Coverage sort: Alphabetical")).toBeInTheDocument();
    expect(screen.getByText("Footprint sort: Country name (Z-A)")).toBeInTheDocument();
    expect(screen.getByText("Footprint search: nor")).toBeInTheDocument();
    expect(screen.getByLabelText("Search footprint markets")).toHaveValue("nor");

    fireEvent.click(
      screen.getByRole("button", { name: "Clear footprint search query" }),
    );

    expect(screen.getByLabelText("Search footprint markets")).toHaveValue("");
    await waitFor(() =>
      expect(window.location.search).toBe(
        "?brand=XPeng&country=SWE&view=brands&region=Europe&coverageSort=name&footprintSort=name-desc",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset footprint sort" }));

    expect(screen.getByLabelText("Sort footprint")).toHaveDisplayValue("Country name (A-Z)");
    await waitFor(() =>
      expect(window.location.search).toBe(
        "?brand=XPeng&country=SWE&view=brands&region=Europe&coverageSort=name",
      ),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Clear active country selection" }),
    );

    expect(screen.getByLabelText("Country lookup")).toHaveValue("");
    await waitFor(() =>
      expect(window.location.search).toBe(
        "?brand=XPeng&view=brands&region=Europe&coverageSort=name",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear active brand filter" }));

    expect(screen.getByLabelText("Brand filter")).toHaveValue("");
    expect(screen.queryByText("Brand footprint")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(window.location.search).toBe("?view=brands&region=Europe&coverageSort=name"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset coverage sort" }));

    expect(screen.getByLabelText("Sort rankings")).toHaveDisplayValue("Coverage strength");
    await waitFor(() => expect(window.location.search).toBe("?view=brands&region=Europe"));

    fireEvent.click(screen.getByRole("button", { name: "Clear active region filter" }));

    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("All regions");
    await waitFor(() => expect(window.location.search).toBe(""));
    expect(screen.queryByText("Active view")).not.toBeInTheDocument();
  });

  it("renders the dataset summary overlay, country details, and shareable view state", async () => {
    vi.doUnmock("../src/components/MapCanvas");
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
    expect(
      within(initialDetailsPanel!).getByText("Brands active elsewhere in Europe"),
    ).toBeInTheDocument();
    expect(
      within(initialDetailsPanel!).getByRole("button", { name: /BYD/i }),
    ).toBeInTheDocument();
    expect(
      within(initialDetailsPanel!).getByRole("button", { name: /XPeng/i }),
    ).toBeInTheDocument();

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(within(footprintPanel!).getByText("XPeng · 1 market")).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByLabelText("Search footprint markets"),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByText("Showing 1 of 1 market"),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByLabelText("Sort footprint"),
    ).toHaveDisplayValue("Country name (A-Z)");
    expect(
      within(footprintPanel!).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("link", {
        name: "Open official source for Norway",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com/no");
    expect(
      within(footprintPanel!).getByRole("link", {
        name: "Open official website for XPeng",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com");
    expect(within(footprintPanel!).getByText("2 sources")).toBeInTheDocument();
    fireEvent.click(
      within(footprintPanel!).getByRole("button", { name: "Copy website URL" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://www.xpeng.com",
    );
    expect(
      await screen.findByRole("button", {
        name: "Copied website URL",
      }),
    ).toBeInTheDocument();
    fireEvent.click(within(footprintPanel!).getByRole("button", { name: "Copy sources" }));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://www.xpeng.com/no\nhttps://www.xpeng.com/no/service",
    );
    fireEvent.click(
      within(footprintPanel!).getByRole("button", { name: "Copy visible markets" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Norway (NOR - Europe)",
    );

    fireEvent.click(await screen.findByRole("button", { name: "Hover Norway" }));
    const previewPanel = screen.getByRole("heading", { name: "Map preview" }).closest(
      "div",
    );
    expect(previewPanel).not.toBeNull();
    expect(within(previewPanel!).getByText("Norway")).toBeInTheDocument();
    expect(within(previewPanel!).getByText("NOR · 1 brand")).toBeInTheDocument();
    expect(
      within(previewPanel!).getByRole("button", { name: "Showing footprint" }),
    ).toBeInTheDocument();
    expect(
      within(previewPanel!).getByRole("link", {
        name: "Open official source for XPeng in Norway",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com/no");
    expect(within(previewPanel!).getByText("2 sources")).toBeInTheDocument();
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
    expect(within(detailsPanel!).getByText("2 sources")).toBeInTheDocument();
    fireEvent.click(within(detailsPanel!).getByRole("button", { name: "Copy sources" }));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://www.xpeng.com/no\nhttps://www.xpeng.com/no/service",
    );
    expect(
      within(detailsPanel!).getByText(
        "Showing 1 of 2 tracked brands for this country. Clear the brand filter to inspect the rest.",
      ),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng&country=NOR");

    fireEvent.click(
      within(detailsPanel!).getByRole("button", { name: "Copy country + ISO" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith("Norway (NOR)");
    expect(
      await within(detailsPanel!).findByRole("button", { name: "Copied country + ISO" }),
    ).toBeInTheDocument();

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

    fireEvent.change(within(footprintPanel!).getByLabelText("Search footprint markets"), {
      target: { value: "nor" },
    });
    expect(screen.getByRole("button", { name: "Copy share link" })).toBeInTheDocument();
    expect(window.location.search).toBe(
      "?brand=XPeng&country=NOR&footprintQuery=nor",
    );
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute(
      "href",
      "http://localhost:3000/?brand=XPeng&country=NOR&footprintQuery=nor",
    );

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
    expect(
      within(emptyDetailsPanel!).getByText("Brands active elsewhere in Europe"),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng&country=SWE&footprintQuery=nor");

    fireEvent.click(await screen.findByRole("button", { name: "Leave Hover" }));
    expect(screen.queryByRole("heading", { name: "Map preview" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear brand filter" }));
    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
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
      within(coveragePanel!).getByLabelText("Search brand coverage"),
    ).toBeInTheDocument();
    expect(
      within(coveragePanel!).getByText("Showing 2 of 2 brands"),
    ).toBeInTheDocument();
    expect(
      within(coveragePanel!).getByLabelText("Sort rankings"),
    ).toHaveDisplayValue("Coverage strength");
    fireEvent.change(within(coveragePanel!).getByLabelText("Search brand coverage"), {
      target: { value: "BY" },
    });
    expect(
      within(coveragePanel!).getByRole("button", { name: "Clear coverage search" }),
    ).toBeInTheDocument();
    expect(
      within(coveragePanel!).getByText("Showing 1 of 2 brands"),
    ).toBeInTheDocument();
    expect(within(coveragePanel!).getByText("BYD")).toBeInTheDocument();
    expect(within(coveragePanel!).queryByText("XPeng")).not.toBeInTheDocument();
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

    const bydFootprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(bydFootprintPanel).not.toBeNull();
    expect(
      within(bydFootprintPanel!).getByText("Showing 2 of 2 markets"),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).getByRole("link", {
        name: "Open official website for BYD",
      }),
    ).toHaveAttribute("href", "https://www.byd.com");
    const footprintItems = within(bydFootprintPanel!).getAllByRole("listitem");
    expect(within(footprintItems[0]).getByRole("button", { name: /China/i })).toBeInTheDocument();
    expect(within(footprintItems[0]).getByText("1 source")).toBeInTheDocument();
    expect(within(footprintItems[1]).getByRole("button", { name: /Norway/i })).toBeInTheDocument();
    expect(within(footprintItems[1]).getByText("NOR · Europe")).toBeInTheDocument();
    expect(within(footprintItems[1]).getByText("2 sources")).toBeInTheDocument();
    const compactToggle = within(bydFootprintPanel!).getByRole("button", {
      name: "Compact view",
    });
    expect(compactToggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(compactToggle);
    expect(
      within(bydFootprintPanel!).getByRole("button", { name: "Expanded view" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(footprintItems[1]).getByRole("button", { name: /Norway \(NOR\)/i }),
    ).toBeInTheDocument();
    expect(within(footprintItems[1]).queryByText("NOR · Europe")).not.toBeInTheDocument();
    expect(within(footprintItems[1]).queryByText("2 sources")).not.toBeInTheDocument();
    fireEvent.click(
      within(bydFootprintPanel!).getByRole("button", { name: "Expanded view" }),
    );
    expect(
      within(bydFootprintPanel!).getByRole("button", { name: "Compact view" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(within(footprintItems[1]).getByText("NOR · Europe")).toBeInTheDocument();
    fireEvent.change(within(bydFootprintPanel!).getByLabelText("Sort footprint"), {
      target: { value: "name-desc" },
    });
    expect(window.location.search).toBe("?country=SWE&brand=BYD&footprintSort=name-desc");
    const reversedFootprintItems = within(bydFootprintPanel!).getAllByRole("listitem");
    expect(
      within(reversedFootprintItems[0]).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(reversedFootprintItems[1]).getByRole("button", { name: /China/i }),
    ).toBeInTheDocument();
    fireEvent.change(
      within(bydFootprintPanel!).getByLabelText("Search footprint markets"),
      {
        target: { value: "nor" },
      },
    );
    expect(
      within(bydFootprintPanel!).getByRole("button", { name: "Clear footprint search" }),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).getByText("Showing 1 of 2 markets"),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).queryByRole("button", { name: /China/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(bydFootprintPanel!).getByRole("button", { name: "Clear footprint search" }),
    );
    expect(
      within(bydFootprintPanel!).getByLabelText("Search footprint markets"),
    ).toHaveValue("");
    expect(
      within(bydFootprintPanel!).getByText("Showing 2 of 2 markets"),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE&brand=BYD&footprintSort=name-desc");
    fireEvent.change(
      within(bydFootprintPanel!).getByLabelText("Search footprint markets"),
      {
        target: { value: "euro" },
      },
    );
    expect(
      within(bydFootprintPanel!).getByText("Showing 1 of 2 markets"),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(bydFootprintPanel!).queryByRole("button", { name: /China/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear brand filter" }));

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
      within(countryCoveragePanel!).getByLabelText("Search country coverage"),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("Showing 2 of 2 countries"),
    ).toBeInTheDocument();
    fireEvent.change(
      within(countryCoveragePanel!).getByLabelText("Search country coverage"),
      {
        target: { value: "CHI" },
      },
    );
    expect(
      within(countryCoveragePanel!).getByRole("button", { name: "Clear coverage search" }),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("Showing 1 of 2 countries"),
    ).toBeInTheDocument();
    expect(within(countryCoveragePanel!).getByText("China")).toBeInTheDocument();
    expect(within(countryCoveragePanel!).queryByText("Norway")).not.toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("1 confirmed brand"),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("BYD"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(countryCoveragePanel!).getByRole("button", { name: "Clear coverage search" }),
    );
    expect(
      within(countryCoveragePanel!).getByLabelText("Search country coverage"),
    ).toHaveValue("");
    expect(
      within(countryCoveragePanel!).getByText("Norway"),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("2 confirmed brands"),
    ).toBeInTheDocument();
    expect(
      within(countryCoveragePanel!).getByText("BYD, XPeng"),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE&footprintSort=name-desc&view=countries");
    fireEvent.change(within(countryCoveragePanel!).getByLabelText("Sort rankings"), {
      target: { value: "name" },
    });
    expect(window.location.search).toBe(
      "?country=SWE&footprintSort=name-desc&view=countries&coverageSort=name",
    );
    const sortedCountryItems = within(countryCoveragePanel!).getAllByRole("listitem");
    expect(
      within(sortedCountryItems[0]).getByRole("button", { name: /China/i }),
    ).toBeInTheDocument();
    expect(
      within(sortedCountryItems[1]).getByRole("button", { name: /Norway/i }),
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
    fireEvent.click(
      within(allBrandsNorwayPanel!).getByRole("button", { name: "Copy all sources" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      [
        "https://www.byd.com/no",
        "https://www.byd.com/no/dealers",
        "https://www.xpeng.com/no",
        "https://www.xpeng.com/no/service",
      ].join("\n"),
    );
    expect(window.location.search).toBe(
      "?country=NOR&footprintSort=name-desc&view=countries&coverageSort=name",
    );

    fireEvent.click(
      within(allBrandsNorwayPanel!).getByRole("button", {
        name: "Show XPeng footprint",
      }),
    );
    expect(screen.getByDisplayValue("XPeng")).toBeInTheDocument();
    expect(window.location.search).toBe(
      "?country=NOR&footprintSort=name-desc&view=countries&coverageSort=name&brand=XPeng",
    );
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
  });

  it("lets users apply a brand filter from the map preview", async () => {
    vi.doUnmock("../src/components/MapCanvas");
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
    expect(await screen.findByRole("button", { name: "Hover Norway" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hover Norway" }));

    const previewPanel = screen.getByRole("heading", { name: "Map preview" }).closest(
      "div",
    );
    expect(previewPanel).not.toBeNull();
    expect(
      within(previewPanel!).getByRole("button", { name: "Show XPeng footprint" }),
    ).toBeInTheDocument();
    expect(
      within(previewPanel!).getByRole("button", { name: "Show BYD footprint" }),
    ).toBeInTheDocument();
    expect(
      within(previewPanel!).getByRole("link", {
        name: "Open official source for XPeng in Norway",
      }),
    ).toHaveAttribute("href", "https://www.xpeng.com/no");

    fireEvent.click(
      within(previewPanel!).getByRole("button", { name: "Show XPeng footprint" }),
    );

    expect(screen.getByDisplayValue("XPeng")).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng");

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(within(footprintPanel!).getByText("XPeng · 1 market")).toBeInTheDocument();
  });

  it("explains uncertain badges in the footprint and country details panels", async () => {
    vi.doUnmock("../src/components/MapCanvas");
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockUncertainData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState({}, "", "/?brand=BYD&country=NOR");

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const detailsPanel = screen.getByRole("heading", { name: "Norway" }).closest("aside");
    expect(detailsPanel).not.toBeNull();
    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();

    const expectedTooltip =
      "Official presence is tracked here, but the supporting evidence still needs direct verification or reconciliation.";

    expect(
      within(detailsPanel!).getByText("Uncertain", { selector: "span" }),
    ).toHaveAttribute("title", expectedTooltip);
    expect(
      within(footprintPanel!).getByText("Uncertain", { selector: "span" }),
    ).toHaveAttribute("title", expectedTooltip);
    expect(within(detailsPanel!).getByText("2 sources")).toBeInTheDocument();
    expect(within(footprintPanel!).getByText("2 sources")).toBeInTheDocument();
    expect(screen.getByText("BYD confirmed")).toBeInTheDocument();
    expect(screen.getByText("BYD uncertain")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Highlighting the countries where BYD has tracked official presence, with lighter fills for uncertain entries.",
      ),
    ).toBeInTheDocument();
  });

  it("filters the selected brand footprint down to uncertain markets and persists the toggle in the URL", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockUncertainData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "BYD" },
    });

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(within(footprintPanel!).getByRole("button", { name: /China/i })).toBeInTheDocument();
    expect(within(footprintPanel!).getByRole("button", { name: /Norway/i })).toBeInTheDocument();

    fireEvent.click(
      within(footprintPanel!).getByLabelText("Show only uncertain markets"),
    );

    expect(window.location.search).toBe(
      "?brand=BYD&footprintUncertainOnly=true",
    );
    expect(
      within(footprintPanel!).getByLabelText("Show only uncertain markets"),
    ).toBeChecked();
    expect(within(footprintPanel!).getByText("Showing 1 of 2 markets")).toBeInTheDocument();
    expect(within(footprintPanel!).getByRole("button", { name: /Norway/i })).toBeInTheDocument();
    expect(
      within(footprintPanel!).queryByRole("button", { name: /China/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear uncertain-only footprint filter" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute(
      "href",
      "http://localhost:3000/?brand=BYD&footprintUncertainOnly=true",
    );
  });

  it("filters coverage panels down to uncertain entries and persists the toggle in the URL", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockUncertainData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();

    const uncertainToggle = within(coveragePanel!).getByLabelText(
      "Show only brands with uncertain presence",
    );
    fireEvent.click(uncertainToggle);

    expect(window.location.search).toBe("?uncertainOnly=true");
    expect(within(coveragePanel!).getByText("Showing 1 of 1 brand")).toBeInTheDocument();
    expect(within(coveragePanel!).getByText("BYD")).toBeInTheDocument();
    expect(within(coveragePanel!).queryByText("XPeng")).not.toBeInTheDocument();

    fireEvent.click(within(coveragePanel!).getByRole("tab", { name: "Countries" }));

    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    expect(
      Object.fromEntries(new URLSearchParams(window.location.search).entries()),
    ).toEqual({
      uncertainOnly: "true",
      view: "countries",
    });
    expect(
      within(countryCoveragePanel!).getByLabelText(
        "Show only countries with uncertain presence",
      ),
    ).toBeChecked();
    expect(within(countryCoveragePanel!).getByText("Showing 1 of 1 country")).toBeInTheDocument();
    expect(within(countryCoveragePanel!).getByText("Norway")).toBeInTheDocument();
    expect(within(countryCoveragePanel!).queryByText("China")).not.toBeInTheDocument();

    fireEvent.click(within(countryCoveragePanel!).getByRole("tab", { name: "Regions" }));

    const regionalCoveragePanel = screen
      .getByRole("heading", { name: "Regional coverage" })
      .closest("aside");
    expect(regionalCoveragePanel).not.toBeNull();
    expect(
      Object.fromEntries(new URLSearchParams(window.location.search).entries()),
    ).toEqual({
      uncertainOnly: "true",
      view: "regions",
    });
    expect(
      within(regionalCoveragePanel!).getByLabelText(
        "Show only regions with uncertain presence",
      ),
    ).toBeChecked();
    expect(within(regionalCoveragePanel!).getByText("Showing 0 of 0 regions")).toBeInTheDocument();
    expect(
      within(regionalCoveragePanel!).getByText(
        "No regions with uncertain presence in this view.",
      ),
    ).toBeInTheDocument();
    expect(within(regionalCoveragePanel!).queryByText("Europe")).not.toBeInTheDocument();
    expect(within(regionalCoveragePanel!).queryByText("Asia")).not.toBeInTheDocument();
  });

  it("shows an explicit empty state when the uncertain-only coverage filter has no matches", async () => {
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

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();

    fireEvent.click(
      within(coveragePanel!).getByLabelText("Show only brands with uncertain presence"),
    );

    expect(
      within(coveragePanel!).getByText("No brands with uncertain presence in this view."),
    ).toBeInTheDocument();
    expect(within(coveragePanel!).getByText("Showing 0 of 0 brands")).toBeInTheDocument();
  });

  it("supports searchable country lookup suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const countryLookup = await screen.findByLabelText("Country lookup");
    expect(countryLookup).toBeInTheDocument();

    fireEvent.change(countryLookup, { target: { value: "sw" } });

    expect(screen.getByText("Showing 1 matching country")).toBeInTheDocument();
    const countrySuggestions = screen.getByText("Showing 1 matching country").closest("div");
    expect(countrySuggestions).not.toBeNull();
    expect(within(countrySuggestions!).getByRole("option", { name: /Sweden/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sweden" })).not.toBeInTheDocument();

    fireEvent.click(within(countrySuggestions!).getByRole("option", { name: /Sweden/i }));

    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Sweden");
    expect(screen.getByRole("heading", { name: "Sweden" })).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE");

    fireEvent.click(screen.getByRole("button", { name: "Clear country lookup" }));

    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("");
    expect(screen.queryByRole("heading", { name: "Sweden" })).not.toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("selects the only country lookup suggestion on Enter", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const countryLookup = await screen.findByLabelText("Country lookup");
    fireEvent.change(countryLookup, { target: { value: "sw" } });

    expect(screen.getByText("Showing 1 matching country")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Sweden/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    fireEvent.keyDown(countryLookup, { key: "Enter" });

    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Sweden");
    expect(screen.getByRole("heading", { name: "Sweden" })).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE");
  });

  it("supports keyboard navigation for country lookup suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const countryLookup = await screen.findByLabelText("Country lookup");
    fireEvent.change(countryLookup, { target: { value: "sw" } });

    const swedenOption = screen.getByRole("option", { name: /Sweden/i });
    expect(swedenOption).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(countryLookup, { key: "ArrowDown" });
    expect(swedenOption).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(countryLookup, { key: "Enter" });
    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Sweden");
    expect(screen.getByRole("heading", { name: "Sweden" })).toBeInTheDocument();
    expect(window.location.search).toBe("?country=SWE");
  });

  it("supports searchable brand filter suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const brandFilter = await screen.findByLabelText("Brand filter");
    expect(brandFilter).toBeInTheDocument();

    fireEvent.change(brandFilter, { target: { value: "xp" } });

    expect(screen.getByText("Showing 1 matching brand")).toBeInTheDocument();
    const xpengSuggestion = screen.getByRole("option", { name: "XPeng" });
    expect(xpengSuggestion).toBeInTheDocument();
    expect(within(xpengSuggestion).getByText("1 confirmed market")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Brand footprint" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "XPeng" }));

    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("XPeng");
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng");

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "tesla" },
    });

    expect(screen.getByText("Showing 0 matching brands")).toBeInTheDocument();
    expect(screen.getByText("No brands match this search yet.")).toBeInTheDocument();
  });

  it("selects the only brand filter suggestion on Enter", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const brandFilter = await screen.findByLabelText("Brand filter");
    fireEvent.change(brandFilter, { target: { value: "xp" } });

    expect(screen.getByText("Showing 1 matching brand")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "XPeng" })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    fireEvent.keyDown(brandFilter, { key: "Enter" });

    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("XPeng");
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng");
  });

  it("shows uncertain counts in brand filter suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockUncertainData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const brandFilter = await screen.findByLabelText("Brand filter");
    fireEvent.change(brandFilter, { target: { value: "by" } });

    const bydSuggestion = screen.getByRole("option", { name: "BYD" });
    expect(bydSuggestion).toBeInTheDocument();
    expect(
      within(bydSuggestion).getByText("1 confirmed market · 1 uncertain"),
    ).toBeInTheDocument();
  });

  it("shows a region breakdown for the selected brand footprint", async () => {
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

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "BYD" },
    });

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();

    expect(within(footprintPanel!).getByText("Footprint regions")).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("button", {
        name: /All regions · 2 markets/i,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(footprintPanel!).getByRole("button", {
        name: /Asia · 1 market/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("button", {
        name: /Europe · 1 market/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(footprintPanel!).getByRole("button", {
        name: /Europe · 1 market/i,
      }),
    );

    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("Europe");
    expect(window.location.search).toBe("?brand=BYD&view=brands&region=Europe");
    expect(
      within(footprintPanel!).getByRole("button", {
        name: /Europe · 1 market/i,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(footprintPanel!).getByText("Filtering markets to Europe"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(footprintPanel!).getByRole("button", { name: "Copy visible markets" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Norway (NOR - Europe)",
    );
    expect(
      within(footprintPanel!).getByRole("button", { name: "Copied visible markets" }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(footprintPanel!).getByRole("button", {
        name: /All regions · 2 markets/i,
      }),
    );

    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("All regions");
    expect(window.location.search).toBe("?brand=BYD");
    expect(
      within(footprintPanel!).getByRole("button", { name: "Copy visible markets" }),
    ).toBeInTheDocument();
  });

  it("supports region-based sorting in the selected brand footprint", async () => {
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

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "BYD" },
    });

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();

    fireEvent.change(within(footprintPanel!).getByLabelText("Sort footprint"), {
      target: { value: "region-desc" },
    });

    const marketButtons = within(footprintPanel!)
      .getAllByRole("button")
      .filter(
        (button) =>
          button.textContent?.includes("China") ||
          button.textContent?.includes("Norway"),
      );
    expect(marketButtons.map((button) => button.textContent)).toEqual([
      expect.stringContaining("Norway"),
      expect.stringContaining("China"),
    ]);
    expect(window.location.search).toBe("?brand=BYD&footprintSort=region-desc");
  });

  it("supports keyboard navigation for brand filter suggestions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    const brandFilter = await screen.findByLabelText("Brand filter");
    fireEvent.change(brandFilter, { target: { value: "xp" } });

    const xpengOption = screen.getByRole("option", { name: "XPeng" });
    expect(xpengOption).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(brandFilter, { key: "ArrowDown" });
    expect(xpengOption).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(brandFilter, { key: "Enter" });
    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("XPeng");
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
    expect(window.location.search).toBe("?brand=XPeng");
  });

  it("closes the floating detail panels with Escape", async () => {
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

    fireEvent.click(await screen.findByRole("button", { name: "Select Norway" }));
    const detailsPanel = screen.getByRole("heading", { name: "Norway" }).closest("aside");
    expect(detailsPanel).not.toBeNull();
    expect(detailsPanel).toHaveAttribute("aria-labelledby", "selected-country-heading");
    detailsPanel!.focus();
    fireEvent.keyDown(detailsPanel!, { key: "Escape" });
    expect(screen.queryByRole("heading", { name: "Norway" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "XPeng" },
    });
    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(footprintPanel).toHaveAttribute("aria-labelledby", "brand-footprint-heading");
    footprintPanel!.focus();
    fireEvent.keyDown(footprintPanel!, { key: "Escape" });
    expect(screen.queryByRole("heading", { name: "Brand footprint" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
  });

  it("supports keyboard shortcuts for filter focus, clearing searches, and coverage tabs", async () => {
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

    const brandFilter = screen.getByLabelText("Brand filter");
    const countryLookup = screen.getByLabelText("Country lookup");
    countryLookup.focus();
    expect(countryLookup).toHaveFocus();

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(brandFilter).toHaveFocus();

    fireEvent.change(brandFilter, { target: { value: "XPeng" } });
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();
    fireEvent.keyDown(brandFilter, { key: "Escape" });
    expect(brandFilter).toHaveDisplayValue("");
    expect(screen.queryByRole("heading", { name: "Brand footprint" })).not.toBeInTheDocument();

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();
    const brandTab = within(coveragePanel!).getByRole("tab", { name: "Brands" });
    brandTab.focus();
    expect(brandTab).toHaveFocus();

    fireEvent.keyDown(brandTab, {
      key: "ArrowRight",
    });

    expect(window.location.search).toBe("?view=countries");
    expect(within(coveragePanel!).getByRole("tab", { name: "Countries" })).toHaveFocus();
    fireEvent.keyDown(within(coveragePanel!).getByRole("tab", { name: "Countries" }), {
      key: "End",
    });
    expect(window.location.search).toBe("?view=regions");
    expect(within(coveragePanel!).getByRole("tab", { name: "Regions" })).toHaveFocus();
    fireEvent.keyDown(within(coveragePanel!).getByRole("tab", { name: "Regions" }), {
      key: "Home",
    });
    expect(window.location.search).toBe("");
    expect(within(coveragePanel!).getByRole("tab", { name: "Brands" })).toHaveFocus();

    fireEvent.keyDown(within(coveragePanel!).getByRole("tab", { name: "Brands" }), {
      key: "ArrowRight",
    });
    expect(window.location.search).toBe("?view=countries");
    const countryCoverageSearch = await screen.findByLabelText("Search country coverage");
    fireEvent.change(countryCoverageSearch, { target: { value: "nor" } });
    expect(countryCoverageSearch).toHaveDisplayValue("nor");
    fireEvent.keyDown(countryCoverageSearch, { key: "Escape" });
    expect(countryCoverageSearch).toHaveDisplayValue("");

    fireEvent.change(countryLookup, { target: { value: "SWE" } });
    expect(screen.getByRole("heading", { name: "Sweden" })).toBeInTheDocument();
    fireEvent.keyDown(countryLookup, { key: "Escape" });
    expect(countryLookup).toHaveDisplayValue("");
    expect(screen.queryByRole("heading", { name: "Sweden" })).not.toBeInTheDocument();
  });

  it("resets the current view back to the default map state", async () => {
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

    const resetButton = screen.getByRole("button", { name: "Reset view" });
    expect(resetButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Brand filter"), {
      target: { value: "XPeng" },
    });
    fireEvent.change(screen.getByLabelText("Region filter"), {
      target: { value: "Europe" },
    });
    fireEvent.change(screen.getByLabelText("Country lookup"), {
      target: { value: "SWE" },
    });

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    fireEvent.change(within(footprintPanel!).getByLabelText("Sort footprint"), {
      target: { value: "name-desc" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear brand filter" }));

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();
    fireEvent.click(
      within(coveragePanel!).getByRole("tab", { name: "Countries" }),
    );
    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    fireEvent.change(within(countryCoveragePanel!).getByLabelText("Search country coverage"), {
      target: { value: "nor" },
    });
    fireEvent.change(within(countryCoveragePanel!).getByLabelText("Sort rankings"), {
      target: { value: "name" },
    });
    fireEvent.click(
      within(countryCoveragePanel!).getByLabelText(
        "Show only countries with uncertain presence",
      ),
    );

    expect(screen.getByRole("button", { name: "Reset view" })).toBeEnabled();
    expect(
      Object.fromEntries(new URLSearchParams(window.location.search).entries()),
    ).toEqual({
      country: "SWE",
      view: "countries",
      region: "Europe",
      coverageQuery: "nor",
      coverageSort: "name",
      uncertainOnly: "true",
      footprintSort: "name-desc",
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));

    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
    expect(screen.getByLabelText("Region filter")).toHaveDisplayValue("All regions");
    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("");
    expect(screen.queryByRole("heading", { name: "Sweden" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brand coverage" })).toBeInTheDocument();
    expect(screen.getByLabelText("Sort rankings")).toHaveDisplayValue("Coverage strength");
    expect(screen.getByRole("button", { name: "Reset view" })).toBeDisabled();
    expect(window.location.search).toBe("");
  });

  it("applies the region filter across the map summary, lookup, and brand footprint", async () => {
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

    fireEvent.change(screen.getByLabelText("Region filter"), {
      target: { value: "Europe" },
    });

    expect(window.location.search).toBe("?view=brands&region=Europe");
    expect(
      screen.getByText("Highlighting confirmed tracked brand presence within Europe."),
    ).toBeInTheDocument();
    expect(screen.getByText("All brands · Europe")).toBeInTheDocument();
    const countriesInViewRow = screen.getByText("Countries in view").closest("div");
    expect(countriesInViewRow).toHaveTextContent("1");

    fireEvent.change(screen.getByLabelText("Country lookup"), {
      target: { value: "chi" },
    });
    expect(screen.getByText("No countries match this search yet.")).toBeInTheDocument();

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();
    fireEvent.click(within(coveragePanel!).getByRole("button", { name: /BYD/i }));

    expect(window.location.search).toBe("?view=brands&region=Europe&brand=BYD");
    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(
      within(footprintPanel!).getByText("Filtering markets to Europe"),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByText("Showing 1 of 1 market"),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("button", { name: /Norway/i }),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).queryByRole("button", { name: /China/i }),
    ).not.toBeInTheDocument();
  });

  it("adds a regional coverage view that can drill into country rankings", async () => {
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

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();

    fireEvent.click(within(coveragePanel!).getByRole("tab", { name: "Regions" }));
    expect(window.location.search).toBe("?view=regions");

    const regionalCoveragePanel = screen
      .getByRole("heading", { name: "Regional coverage" })
      .closest("aside");
    expect(regionalCoveragePanel).not.toBeNull();
    expect(
      within(regionalCoveragePanel!).getByText(
        "Compare confirmed coverage across regions and drill into the strongest clusters.",
      ),
    ).toBeInTheDocument();
    expect(
      within(regionalCoveragePanel!).getByLabelText("Search regional coverage"),
    ).toBeInTheDocument();
    expect(
      within(regionalCoveragePanel!).getByText("Showing 2 of 2 regions"),
    ).toBeInTheDocument();
    const europeRegionRow = within(regionalCoveragePanel!)
      .getByText("Europe")
      .closest("li");
    expect(europeRegionRow).not.toBeNull();
    expect(
      within(europeRegionRow!).getByText("1 confirmed country"),
    ).toBeInTheDocument();
    expect(
      within(europeRegionRow!).getByText("2 tracked brands"),
    ).toBeInTheDocument();
    expect(
      within(europeRegionRow!).getByText("BYD, XPeng"),
    ).toBeInTheDocument();
    fireEvent.change(within(regionalCoveragePanel!).getByLabelText("Sort rankings"), {
      target: { value: "name" },
    });
    expect(window.location.search).toBe("?view=regions&coverageSort=name");
    const sortedRegionItems = within(regionalCoveragePanel!).getAllByRole("listitem");
    expect(within(sortedRegionItems[0]).getByRole("button", { name: /Asia/i })).toBeInTheDocument();
    expect(
      within(sortedRegionItems[1]).getByRole("button", { name: /Europe/i }),
    ).toBeInTheDocument();

    fireEvent.change(
      within(regionalCoveragePanel!).getByLabelText("Search regional coverage"),
      {
        target: { value: "asia" },
      },
    );
    expect(
      within(regionalCoveragePanel!).getByText("Showing 1 of 2 regions"),
    ).toBeInTheDocument();
    expect(within(regionalCoveragePanel!).getByText("Asia")).toBeInTheDocument();
    expect(within(regionalCoveragePanel!).queryByText("Europe")).not.toBeInTheDocument();

    fireEvent.change(
      within(regionalCoveragePanel!).getByLabelText("Search regional coverage"),
      {
        target: { value: "" },
      },
    );

    fireEvent.click(
      within(regionalCoveragePanel!).getByRole("button", { name: /Europe/i }),
    );
    expect(window.location.search).toBe("?view=countries&coverageSort=name&region=Europe");

    const drilledCountryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(drilledCountryCoveragePanel).not.toBeNull();
    expect(
      within(drilledCountryCoveragePanel!).getByText("Filtering countries to Europe"),
    ).toBeInTheDocument();
    expect(
      within(drilledCountryCoveragePanel!).getByText("Showing 1 of 1 country"),
    ).toBeInTheDocument();
    expect(within(drilledCountryCoveragePanel!).getByText("Norway")).toBeInTheDocument();
    expect(
      within(drilledCountryCoveragePanel!).queryByText("Sweden"),
    ).not.toBeInTheDocument();
    expect(
      within(drilledCountryCoveragePanel!).queryByText("China"),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(drilledCountryCoveragePanel!).getByRole("button", {
        name: "Clear region",
      }),
    );
    expect(window.location.search).toBe("?view=countries&coverageSort=name");
    expect(
      within(drilledCountryCoveragePanel!).getByText("Showing 2 of 2 countries"),
    ).toBeInTheDocument();
    expect(within(drilledCountryCoveragePanel!).getByText("China")).toBeInTheDocument();
  });

  it("copies the visible coverage rankings for brands, countries, and regions", async () => {
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

    const coveragePanel = screen
      .getByRole("heading", { name: "Brand coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();

    fireEvent.click(
      within(coveragePanel!).getByRole("button", { name: "Copy visible brands" }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      ["BYD (2 confirmed markets)", "XPeng (1 confirmed market)"].join("\n"),
    );

    fireEvent.click(within(coveragePanel!).getByRole("tab", { name: "Countries" }));

    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    fireEvent.change(within(countryCoveragePanel!).getByLabelText("Search country coverage"), {
      target: { value: "nor" },
    });

    fireEvent.click(
      within(countryCoveragePanel!).getByRole("button", {
        name: "Copy visible countries",
      }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      "Norway (NOR - Europe - 2 confirmed brands) — BYD, XPeng",
    );

    fireEvent.click(within(countryCoveragePanel!).getByRole("tab", { name: "Regions" }));

    const regionalCoveragePanel = screen
      .getByRole("heading", { name: "Regional coverage" })
      .closest("aside");
    expect(regionalCoveragePanel).not.toBeNull();
    fireEvent.click(
      within(regionalCoveragePanel!).getByRole("button", {
        name: "Copy visible regions",
      }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      [
        "Europe (1 confirmed country - 2 tracked brands) — BYD, XPeng",
        "Asia (1 confirmed country - 1 tracked brand) — BYD",
      ].join("\n"),
    );
  });

  it("shows major-region gaps and lets users focus a listed brand and region", async () => {
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

    const summaryPanel = screen.getByText("Dataset summary").closest("div");
    expect(summaryPanel).not.toBeNull();
    expect(within(summaryPanel!).getByText("Major region gaps")).toBeInTheDocument();
    expect(within(summaryPanel!).getByText("BYD")).toBeInTheDocument();
    expect(within(summaryPanel!).getAllByText("Southeast Asia")).toHaveLength(2);
    fireEvent.click(
      within(summaryPanel!).getByRole("button", {
        name: "Copy gap priorities",
      }),
    );
    expect(window.navigator.clipboard.writeText).toHaveBeenLastCalledWith(
      [
        "BYD (2 confirmed markets - 1/4 major regions covered) — missing Southeast Asia, Americas, Middle East",
        "XPeng (1 confirmed market - 1/4 major regions covered) — missing Southeast Asia, Americas, Middle East",
      ].join("\n"),
    );

    fireEvent.click(
      within(summaryPanel!).getByRole("button", {
        name: "Show BYD footprint",
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Brand filter")).toHaveValue("BYD");
    });

    fireEvent.click(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Brand filter")).toHaveValue("BYD");
    });

    expect(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(
      within(footprintPanel!).getByText(
        "Gap focus: Southeast Asia still has no confirmed presence for BYD.",
      ),
    ).toBeInTheDocument();
    expect(
      within(footprintPanel!).getByRole("button", { name: "Clear gap focus" }),
    ).toBeInTheDocument();
    expect(within(footprintPanel!).getByText("Showing 2 of 2 markets")).toBeInTheDocument();

    fireEvent.click(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    );

    expect(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(footprintPanel!).queryByText(
        "Gap focus: Southeast Asia still has no confirmed presence for BYD.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toHaveValue("BYD");

    fireEvent.click(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    );

    expect(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(footprintPanel!).getByText(
        "Gap focus: Southeast Asia still has no confirmed presence for BYD.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(within(footprintPanel!).getByRole("button", { name: "Clear gap focus" }));

    expect(
      within(summaryPanel!).getByRole("button", {
        name: "Inspect BYD gap in Southeast Asia",
      }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(footprintPanel!).queryByText(
        "Gap focus: Southeast Asia still has no confirmed presence for BYD.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Brand filter")).toHaveValue("BYD");
  });

  it("restores shareable coverage panel state from the URL", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState(
      {},
      "",
      "/?view=countries&region=Europe&coverageQuery=nor&coverageSort=name&footprintSort=name-desc",
    );

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    expect(
      within(countryCoveragePanel!).getByText("Filtering countries to Europe"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute(
      "href",
      "http://localhost:3000/?view=countries&region=Europe&coverageQuery=nor&coverageSort=name&footprintSort=name-desc",
    );
    expect(within(countryCoveragePanel!).getByLabelText("Sort rankings")).toHaveDisplayValue(
      "Alphabetical",
    );
    expect(
      within(countryCoveragePanel!).getByLabelText("Search country coverage"),
    ).toHaveDisplayValue("nor");
  });

  it("restores uncertain-only coverage state from the URL", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockUncertainData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState(
      {},
      "",
      "/?view=countries&region=Europe&coverageQuery=nor&uncertainOnly=true",
    );

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const countryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(countryCoveragePanel).not.toBeNull();
    expect(
      within(countryCoveragePanel!).getByLabelText(
        "Show only countries with uncertain presence",
      ),
    ).toBeChecked();
    expect(
      within(countryCoveragePanel!).getByText("Filtering countries to Europe"),
    ).toBeInTheDocument();
    expect(within(countryCoveragePanel!).getByText("Showing 1 of 1 country")).toBeInTheDocument();
    expect(within(countryCoveragePanel!).getByText("Norway")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open share link in a new tab" }),
    ).toHaveAttribute(
      "href",
      "http://localhost:3000/?view=countries&region=Europe&coverageQuery=nor&uncertainOnly=true",
    );
  });

  it("adds one-click clear actions for coverage and footprint searches", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState(
      {},
      "",
      "/?brand=BYD&country=NOR&view=countries&coverageQuery=BY&footprintQuery=nor",
    );

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const footprintPanel = screen
      .getByRole("heading", { name: "Brand footprint" })
      .closest("aside");
    expect(footprintPanel).not.toBeNull();
    expect(
      within(footprintPanel!).getByRole("button", { name: "Clear footprint search" }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(footprintPanel!).getByRole("button", { name: "Clear footprint search" }),
    );
    expect(
      within(footprintPanel!).getByLabelText("Search footprint markets"),
    ).toHaveValue("");
    expect(window.location.search).toBe("?brand=BYD&country=NOR&view=countries&coverageQuery=BY");

    cleanup();
    window.history.replaceState({}, "", "/?country=NOR&view=countries&coverageQuery=BY");
    render(<EVMap />);
    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();

    const coveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(coveragePanel).not.toBeNull();
    expect(
      within(coveragePanel!).getByRole("button", { name: "Clear coverage search" }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(coveragePanel!).getByRole("button", { name: "Clear coverage search" }),
    );
    expect(
      within(coveragePanel!).getByLabelText("Search country coverage"),
    ).toHaveValue("");
    expect(window.location.search).toBe("?country=NOR&view=countries");
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
    expect(screen.getByRole("heading", { name: "Brand coverage" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
      expect(window.location.search).toBe("?country=NOR");
    });
  });

  it("drops invalid country query params after loading", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState(
      {},
      "",
      "/?brand=BYD&country=ZZZ&view=countries&region=Europe",
    );

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("BYD");
      expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("");
      expect(screen.queryByRole("heading", { name: "ZZZ" })).not.toBeInTheDocument();
      expect(window.location.search).toBe("?brand=BYD&view=countries&region=Europe");
    });
  });

  it("drops invalid region query params after loading", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.includes("ev-presence.json") ? mockData : mockGeoJson;

      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    });
    window.history.replaceState({}, "", "/?country=NOR&view=countries&region=Atlantis");

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Norway");
      expect(window.location.search).toBe("?country=NOR&view=countries");
    });
  });

  it("syncs brand, country, and coverage state with browser history navigation", async () => {
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
    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
    expect(screen.queryByRole("heading", { name: "Norway" })).not.toBeInTheDocument();

    window.history.pushState({}, "", "/?brand=BYD&country=NOR");
    fireEvent.popState(window);

    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("BYD");
    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Norway");
    expect(screen.getByRole("heading", { name: "Norway" })).toBeInTheDocument();
    expect(screen.getByText("BYD present")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brand footprint" })).toBeInTheDocument();

    window.history.pushState({}, "", "/?country=SWE");
    fireEvent.popState(window);

    expect(screen.getByLabelText("Brand filter")).toHaveDisplayValue("");
    expect(screen.getByLabelText("Country lookup")).toHaveDisplayValue("Sweden");
    expect(screen.getByRole("heading", { name: "Sweden" })).toBeInTheDocument();
    expect(screen.getByText("SWE · 0 brands")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Brand footprint" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brand coverage" })).toBeInTheDocument();

    window.history.pushState({}, "", "/?view=regions");
    fireEvent.popState(window);

    expect(screen.getByRole("heading", { name: "Regional coverage" })).toBeInTheDocument();
    expect(window.location.search).toBe("?view=regions");

    window.history.pushState({}, "", "/?view=countries&region=Europe");
    fireEvent.popState(window);

    const filteredCountryCoveragePanel = screen
      .getByRole("heading", { name: "Country coverage" })
      .closest("aside");
    expect(filteredCountryCoveragePanel).not.toBeNull();
    expect(
      within(filteredCountryCoveragePanel!).getByText("Filtering countries to Europe"),
    ).toBeInTheDocument();
    expect(window.location.search).toBe("?view=countries&region=Europe");
  });

  it("shows a dataset error state when the EV presence data request fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("ev-presence.json")) {
        return new Response("dataset unavailable", { status: 503 });
      }

      return new Response(JSON.stringify(mockGeoJson), {
        headers: { "Content-Type": "application/json" },
      });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset load failed")).toBeInTheDocument();
    expect(
      screen.getByText("The verified EV presence dataset could not be loaded."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Dataset summary")).not.toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load EV presence data:",
      expect.any(Error),
    );
  });

  it("shows a map boundary error state when the country geometry request fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("ev-presence.json")) {
        return new Response(JSON.stringify(mockData), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("geojson unavailable", { status: 503 });
    });

    const { default: EVMap } = await import("../src/components/EVMap");

    render(<EVMap />);

    expect(await screen.findByText("Dataset summary")).toBeInTheDocument();
    expect(await screen.findByText("Map boundaries unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("The world boundary dataset could not be loaded for this session."),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load country boundaries:",
      expect.any(Error),
    );
  });
});
