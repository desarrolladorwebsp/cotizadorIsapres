import { EMBED_HEIGHT_BUFFER_PX } from "@/lib/embed/constants";

function measureElementBottom(el: HTMLElement, rootTop: number): number {
  const rect = el.getBoundingClientRect();
  if (rect.height <= 0 && el.offsetHeight <= 0 && el.scrollHeight <= 0) {
    return 0;
  }
  return Math.max(
    0,
    rect.bottom - rootTop,
    el.offsetTop + el.offsetHeight,
    el.scrollHeight,
  );
}

function measureFlowContent(root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top;
  let maxBottom = measureElementBottom(root, rootTop);

  const sentinel = root.querySelector("[data-embed-height-sentinel]");
  if (sentinel instanceof HTMLElement) {
    maxBottom = Math.max(
      maxBottom,
      measureElementBottom(sentinel, rootTop),
      sentinel.offsetTop + sentinel.offsetHeight,
    );
  }

  root.querySelectorAll<HTMLElement>(":scope > *").forEach((child) => {
    maxBottom = Math.max(maxBottom, measureElementBottom(child, rootTop));
  });

  root.querySelectorAll<HTMLElement>("[data-embed-measure]").forEach((node) => {
    maxBottom = Math.max(maxBottom, measureElementBottom(node, rootTop));
  });

  const results = root.querySelector("#resultados");
  if (results instanceof HTMLElement) {
    maxBottom = Math.max(maxBottom, measureElementBottom(results, rootTop));
  }

  return Math.ceil(
    Math.max(maxBottom, root.scrollHeight, root.offsetHeight),
  );
}

function measureOverlayContent(root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top;
  let maxBottom = 0;

  root.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"]',
  ).forEach((overlay) => {
    maxBottom = Math.max(maxBottom, measureElementBottom(overlay, rootTop));

    overlay.querySelectorAll<HTMLElement>("*").forEach((child) => {
      maxBottom = Math.max(maxBottom, measureElementBottom(child, rootTop));
    });
  });

  return Math.ceil(maxBottom);
}

function measureDocumentHeight(): number {
  const html = document.documentElement;
  const body = document.body;

  return Math.ceil(
    Math.max(
      html.scrollHeight,
      html.offsetHeight,
      body.scrollHeight,
      body.offsetHeight,
    ),
  );
}

/** Altura total del contenido embebido (flujo + modales/alertas). */
export function measureEmbedContentHeight(root: HTMLElement): number {
  const flowHeight = measureFlowContent(root);
  const overlayHeight = measureOverlayContent(root);
  const docHeight = measureDocumentHeight();

  return (
    Math.max(flowHeight, overlayHeight, docHeight) + EMBED_HEIGHT_BUFFER_PX
  );
}

/**
 * Reservado para compatibilidad. El modo embed se aplica en SSR (layout + CSS).
 * Sin mutaciones en html/body para evitar hydration mismatch.
 */
export function lockEmbedDocumentScroll(): () => void {
  return () => undefined;
}
