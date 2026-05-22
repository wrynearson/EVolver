import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyStatus } from "../src/hooks/useCopyStatus";

describe("useCopyStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resets copied and failed states back to idle after the timeout", () => {
    const { result } = renderHook(() => useCopyStatus([]));

    act(() => {
      result.current[1]("copied");
    });
    expect(result.current[0]).toBe("copied");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current[0]).toBe("idle");

    act(() => {
      result.current[1]("failed");
    });
    expect(result.current[0]).toBe("failed");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current[0]).toBe("idle");
  });

  it("resets to idle when its reset dependencies change after mount", () => {
    const { result, rerender } = renderHook(
      ({ marker }) => useCopyStatus([marker]),
      {
        initialProps: { marker: "initial" },
      },
    );

    act(() => {
      result.current[1]("copied");
    });
    expect(result.current[0]).toBe("copied");

    act(() => {
      rerender({ marker: "next" });
    });
    expect(result.current[0]).toBe("idle");
  });
});
