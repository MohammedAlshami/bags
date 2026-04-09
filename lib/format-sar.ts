/** Arabic-Indic (٠–٩) and Persian (۰–۹) to ASCII digits for parsing stored prices. */
const ARABIC_INDIC = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
const PERSIAN_DIGITS = "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9";

function normalizeDigitsToAscii(s: string): string {
  let out = "";
  for (const ch of s) {
    const i = ARABIC_INDIC.indexOf(ch);
    if (i >= 0) {
      out += String(i);
      continue;
    }
    const j = PERSIAN_DIGITS.indexOf(ch);
    if (j >= 0) {
      out += String(j);
      continue;
    }
    out += ch;
  }
  return out;
}

/** ر.س — single locale (Arabic site). */
export function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " ر.س"
  );
}

/**
 * Value for `<input type="number">` when editing a product.
 * Handles ASCII prices (e.g. from seed) and ar-SA formatted strings from `formatSar` (Arabic digits + ٫).
 */
export function parseStoredPriceToInputValue(raw: string): string {
  let s = String(raw).trim();
  if (!s) return "";
  s = normalizeDigitsToAscii(s);
  s = s.replace(/\u066B/g, ".").replace(/,/g, "");
  s = s.replace(/\s*ر\.س\s*$/u, "").trim();
  const m = s.match(/[\d]+(?:\.[\d]+)?/);
  if (!m) return "";
  const n = parseFloat(m[0]);
  if (!Number.isFinite(n)) return "";
  return String(n);
}
