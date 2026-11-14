/**
 * Measure header label width and build a CSS grid template so columns
 * size from the header text (not cell content). Body cells wrap inside
 * those fixed pixel tracks so row height can grow with content.
 */

const DEFAULT_FONT =
  '700 0.75rem system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Cell font used when sizing for DD/MM/YYYY so dates stay on one line. */
const CELL_FONT =
  '500 0.8rem system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Sample date string (DD/MM/YYYY) for column min-width. */
const DATE_SAMPLE = "00/00/0000";

let measureCanvas;

function getMeasureContext(font = DEFAULT_FONT) {
  if (typeof document === "undefined") return null;
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const ctx = measureCanvas.getContext("2d");
  if (ctx) ctx.font = font;
  return ctx;
}

/**
 * Min width that fits a full DD/MM/YYYY date on one line (plus cell padding).
 * @returns {number}
 */
export function getDateColumnMinWidth(paddingX = 24) {
  const ctx = getMeasureContext(CELL_FONT);
  const textWidth = ctx
    ? ctx.measureText(DATE_SAMPLE).width
    : DATE_SAMPLE.length * 8;
  return Math.ceil(textWidth + paddingX);
}

function isDateLikeHeader(header) {
  const h = String(header || "")
    .trim()
    .toUpperCase();
  if (!h) return false;
  return (
    h === "DATE" ||
    h.endsWith(" DATE") ||
    h.startsWith("DATE ") ||
    h.includes(" DATE ") ||
    /(^|[^A-Z])DATE([^A-Z]|$)/.test(h)
  );
}

/**
 * @param {string} text
 * @param {{ font?: string, paddingX?: number, minWidth?: number }} [opts]
 * @returns {number}
 */
export function measureHeaderWidth(text, opts = {}) {
  const { font = DEFAULT_FONT, paddingX = 24, minWidth = 72 } = opts;
  const label = text == null ? "" : String(text);
  const ctx = getMeasureContext(font);
  const textWidth = ctx ? ctx.measureText(label.toUpperCase()).width : label.length * 8;
  return Math.ceil(Math.max(minWidth, textWidth + paddingX));
}

/**
 * @param {string[]} headers
 * @param {{
 *   extraColumns?: Array<string|number>,
 *   font?: string,
 *   paddingX?: number,
 *   minWidth?: number,
 *   specialMins?: Record<string, number>,
 * }} [opts]
 * @returns {number[]} pixel widths per column
 */
export function getHeaderBasedColumnWidths(headers = [], opts = {}) {
  const {
    extraColumns = [],
    font = DEFAULT_FONT,
    paddingX = 24,
    minWidth = 72,
    // Nested BOM mini-table needs room for ShownArray columns without inner scroll
    specialMins = { "DETAILING PRODUCT": 720 },
  } = opts;

  const dateMin = getDateColumnMinWidth(paddingX);

  const widths = (headers || []).map((h) => {
    const fromSpecial = specialMins[h];
    const floor = Math.max(
      fromSpecial ?? minWidth,
      isDateLikeHeader(h) ? dateMin : 0,
    );
    return measureHeaderWidth(h, { font, paddingX, minWidth: floor });
  });

  for (const extra of extraColumns) {
    if (typeof extra === "number") {
      widths.push(extra);
    } else if (typeof extra === "string" && /^\d+(\.\d+)?px$/.test(extra)) {
      widths.push(parseFloat(extra));
    } else {
      widths.push(measureHeaderWidth(extra, { font, paddingX, minWidth }));
    }
  }

  return widths;
}

/**
 * @param {string[]} headers
 * @param {Parameters<typeof getHeaderBasedColumnWidths>[1]} [opts]
 * @returns {string} CSS grid-template-columns value
 */
export function getHeaderBasedGridTemplate(headers = [], opts = {}) {
  const widths = getHeaderBasedColumnWidths(headers, opts);
  return widths.map((px) => `${px}px`).join(" ") || "max-content";
}

/** Default / fallback row height for virtualized lists before measure. */
export const DEFAULT_ROW_HEIGHT = 56;

/**
 * Estimate a wrapped-text cell height for virtualization before DOM measure.
 * @param {unknown} value
 * @param {number} columnWidthPx
 * @param {{ fontSize?: number, lineHeight?: number, paddingY?: number, minHeight?: number }} [opts]
 */
export function estimateWrappedCellHeight(value, columnWidthPx, opts = {}) {
  const {
    fontSize = 12.8,
    lineHeight = 1.35,
    paddingY = 16,
    minHeight = DEFAULT_ROW_HEIGHT,
  } = opts;
  const text = value == null ? "" : String(value);
  if (!text) return minHeight;
  const avgChar = fontSize * 0.55;
  const usable = Math.max(40, columnWidthPx - 20);
  const charsPerLine = Math.max(1, Math.floor(usable / avgChar));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const height = lines * fontSize * lineHeight + paddingY;
  return Math.max(minHeight, Math.ceil(height));
}
