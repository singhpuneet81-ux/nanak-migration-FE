export type EmbedSource = "herosection_chatbot" | "immigration_newsletter";

/** Report iframe content height to WordPress parent — sizes to actual content on all devices. */
export function postEmbedResize(el: HTMLElement | null, source: EmbedSource) {
  if (!el || window.parent === window) return;

  const raw = Math.ceil(
    Math.max(el.getBoundingClientRect().height, el.offsetHeight, el.scrollHeight)
  );
  if (raw < 40) return;

  const absoluteMax = source === "immigration_newsletter" ? 520 : 1200;
  const height = Math.min(raw + 4, absoluteMax);

  const suggestedWidth = source === "herosection_chatbot" ? 440 : undefined;

  const payload = {
    type: "nanak-embed-resize",
    height,
    source,
    compact: true,
    maxHeight: absoluteMax,
    ...(suggestedWidth ? { suggestedWidth } : {}),
  };

  try {
    window.parent.postMessage(payload, "*");
  } catch {
    /* ignore */
  }

  try {
    window.parent.document.querySelectorAll("iframe").forEach((frame) => {
      try {
        if (frame.contentWindow === window) {
          frame.style.height = `${height}px`;
          frame.style.minHeight = "0";
          frame.style.maxHeight = "none";
          frame.style.overflow = "hidden";
          frame.style.display = "block";
          frame.style.width = "100%";
          frame.removeAttribute("height");
          frame.setAttribute("scrolling", "no");
        }
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }
}

/** Re-measure on parent resize / device rotation. */
export function bindEmbedResizeListener(el: HTMLElement | null, source: EmbedSource) {
  if (!el || typeof window === "undefined") return () => {};
  const remeasure = () => postEmbedResize(el, source);
  const onRequest = (e: MessageEvent) => {
    if (e.data?.type === "nanak-embed-request-resize") remeasure();
  };
  window.addEventListener("message", onRequest);
  window.addEventListener("resize", remeasure);
  return () => {
    window.removeEventListener("message", onRequest);
    window.removeEventListener("resize", remeasure);
  };
}
