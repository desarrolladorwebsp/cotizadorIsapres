import { EMBED_HEIGHT_BUFFER_PX } from "@/lib/embed/constants";

function safeMax(...values: number[]): number {
  let max = 0;
  for (const value of values) {
    if (Number.isFinite(value) && value > max) {
      max = value;
    }
  }
  return max;
}

function measureElementBottom(el: Element, rootTop: number): number {
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0 && rect.width <= 0) {
    return 0;
  }

  const fromRect = rect.bottom - rootTop;
  const candidates = [fromRect];

  if (el instanceof HTMLElement) {
    candidates.push(el.scrollHeight);
    if (Number.isFinite(el.offsetTop) && Number.isFinite(el.offsetHeight)) {
      candidates.push(el.offsetTop + el.offsetHeight);
    }
  }

  return safeMax(0, ...candidates);
}

function measureFlowContent(root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top;
  let maxBottom = measureElementBottom(root, rootTop);

  const sentinel = root.querySelector("[data-embed-height-sentinel]");
  if (sentinel instanceof HTMLElement) {
    maxBottom = safeMax(
      maxBottom,
      measureElementBottom(sentinel, rootTop),
      sentinel.offsetTop + sentinel.offsetHeight,
    );
  }

  root.querySelectorAll<HTMLElement>(":scope > *").forEach((child) => {
    maxBottom = safeMax(maxBottom, measureElementBottom(child, rootTop));
  });

  root.querySelectorAll<HTMLElement>("[data-embed-measure]").forEach((node) => {
    maxBottom = safeMax(maxBottom, measureElementBottom(node, rootTop));
  });

  const results = root.querySelector("#resultados");
  if (results instanceof HTMLElement) {
    maxBottom = safeMax(maxBottom, measureElementBottom(results, rootTop));
  }

  return Math.ceil(maxBottom);
}

function isVisibleOverlay(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0 || rect.width <= 0) return false;

  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number.parseFloat(style.opacity) > 0
  );
}

function measureOverlayContent(root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top;
  let maxBottom = 0;

  root.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"]',
  ).forEach((overlay) => {
    if (!isVisibleOverlay(overlay)) return;
    maxBottom = safeMax(maxBottom, measureElementBottom(overlay, rootTop));
  });

  return Math.ceil(maxBottom);
}

function measureDocumentHeight(): number {
  const html = document.documentElement;
  const body = document.body;

  return Math.ceil(
    safeMax(
      html.scrollHeight,
      html.offsetHeight,
      body.scrollHeight,
      body.offsetHeight,
    ),
  );
}

/** Altura total del contenido embebido (flujo + modales/alertas visibles). */
export function measureEmbedContentHeight(root: HTMLElement): number {
  const flowHeight = measureFlowContent(root);
  const overlayHeight = measureOverlayContent(root);
  const contentHeight = safeMax(flowHeight, overlayHeight);

  if (contentHeight > 0) {
    return contentHeight + EMBED_HEIGHT_BUFFER_PX;
  }

  return measureDocumentHeight() + EMBED_HEIGHT_BUFFER_PX;
}

/**
 * Reservado para compatibilidad. El modo embed se aplica en SSR (layout + CSS).
 * Sin mutaciones en html/body para evitar hydration mismatch.
 */
export function lockEmbedDocumentScroll(): () => void {
  return () => undefined;
}
