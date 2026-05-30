export class ClipboardCopyError extends Error {
  readonly reason: "unavailable" | "failed";

  constructor(reason: "unavailable" | "failed", message: string) {
    super(message);
    this.name = "ClipboardCopyError";
    this.reason = reason;
  }
}

export async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      throw new ClipboardCopyError(
        "failed",
        error instanceof Error ? error.message : "Clipboard write failed.",
      );
    }
  }

  if (typeof document === "undefined" || !document.body) {
    throw new ClipboardCopyError("unavailable", "Clipboard is not available.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";

  document.body.append(textarea);
  textarea.focus();
  textarea.select();

  try {
    if (typeof document.execCommand !== "function") {
      throw new ClipboardCopyError("unavailable", "Clipboard is not available.");
    }

    const copied = document.execCommand("copy");

    if (!copied) {
      throw new ClipboardCopyError("failed", "Clipboard copy command failed.");
    }
  } finally {
    textarea.remove();
  }
}
