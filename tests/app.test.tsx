import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock("../src/components/EVMap");
  });

  it("shows a loading fallback while the map chunk is still loading", async () => {
    vi.doMock(
      "../src/components/EVMap",
      () =>
        new Promise(() => {
          // Keep the lazy import pending so Suspense continues to render the fallback.
        }),
    );

    const { default: App } = await import("../src/App");

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading map");
    expect(
      screen.getByText(
        "Preparing the latest verified Chinese EV presence data and interactive map view.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the map once the lazy chunk has loaded", async () => {
    vi.doMock("../src/components/EVMap", () => ({
      default: () => <div>Interactive map ready</div>,
    }));

    const { default: App } = await import("../src/App");

    render(<App />);

    expect(await screen.findByText("Interactive map ready")).toBeInTheDocument();
  });
});
