import { afterEach, describe, expect, it, vi } from "vitest";
import { ClipboardCopyError, copyTextToClipboard } from "../src/lib/clipboard";

describe("copyTextToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to document.execCommand when navigator.clipboard is unavailable", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    await expect(copyTextToClipboard("Bestune")).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).not.toBeInTheDocument();
  });

  it("reports clipboard unavailability when no copy API exists", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: undefined,
    });

    await expect(copyTextToClipboard("Bestune")).rejects.toMatchObject<ClipboardCopyError>({
      name: "ClipboardCopyError",
      reason: "unavailable",
    });
  });
});
