export type CartItem = {
  slug: string;
  name: string;
  /** Current line price in SAR (strict number). */
  saudiRiyal: number;
  oldRiyal?: number | null;
  saudiRiyalBeforeDiscount?: number | null;
  oldRiyalBeforeDiscount?: number | null;
  image: string;
  quantity: number;
  /** Legacy cart rows only; ignored when `saudiRiyal` is set. */
  price?: string;
};

const STORAGE_KEY = "cb-cart";

export function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map(normalizeCartRow).filter((row): row is CartItem => row != null);
  } catch {
    return [];
  }
}

function normalizeCartRow(entry: unknown): CartItem | null {
  if (!entry || typeof entry !== "object") return null;
  const o = entry as Record<string, unknown>;
  const slug = typeof o.slug === "string" ? o.slug.trim() : "";
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const image = typeof o.image === "string" ? o.image.trim() : "";
  const q = typeof o.quantity === "number" ? o.quantity : parseInt(String(o.quantity ?? ""), 10);
  const quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 0;
  if (!slug || !name || quantity < 1) return null;

  let saudiRiyal: number;
  if (typeof o.saudiRiyal === "number" && Number.isFinite(o.saudiRiyal)) {
    saudiRiyal = o.saudiRiyal;
  } else {
    saudiRiyal = parsePrice(String(o.price ?? ""));
  }
  if (!Number.isFinite(saudiRiyal) || saudiRiyal < 0) return null;

  const oldRiyal =
    o.oldRiyal == null || o.oldRiyal === ""
      ? null
      : Number(o.oldRiyal);
  const saudiRiyalBeforeDiscount =
    o.saudiRiyalBeforeDiscount == null || o.saudiRiyalBeforeDiscount === ""
      ? null
      : Number(o.saudiRiyalBeforeDiscount);
  const oldRiyalBeforeDiscount =
    o.oldRiyalBeforeDiscount == null || o.oldRiyalBeforeDiscount === ""
      ? null
      : Number(o.oldRiyalBeforeDiscount);

  const item: CartItem = {
    slug,
    name,
    saudiRiyal,
    image,
    quantity,
    oldRiyal: oldRiyal != null && Number.isFinite(oldRiyal) ? oldRiyal : null,
    saudiRiyalBeforeDiscount:
      saudiRiyalBeforeDiscount != null && Number.isFinite(saudiRiyalBeforeDiscount)
        ? saudiRiyalBeforeDiscount
        : null,
    oldRiyalBeforeDiscount:
      oldRiyalBeforeDiscount != null && Number.isFinite(oldRiyalBeforeDiscount)
        ? oldRiyalBeforeDiscount
        : null,
  };
  return item;
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/** Parse legacy price strings like "242.00 ر.س" to a number */
export function parsePrice(price: string): number {
  const m = price.match(/[\d.,]+/);
  if (!m) return 0;
  const num = m[0].replace(/,/g, "");
  return Number(num) || 0;
}

export function getCartLineSar(item: CartItem): number {
  if (typeof item.saudiRiyal === "number" && Number.isFinite(item.saudiRiyal)) {
    return item.saudiRiyal;
  }
  return parsePrice(item.price ?? "");
}
