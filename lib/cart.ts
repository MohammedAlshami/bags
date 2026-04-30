export type CartItem = {
  slug: string;
  name: string;
  price: string;
  /** Yemeni riyal amount for dual-price display (ر.ق / ر.س); optional for legacy cart rows */
  oldRiyal?: number | null;
  image: string;
  quantity: number;
};

const STORAGE_KEY = "cb-cart";

export function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/** Parse price strings like "$1,280" or "242.00 ر.س" to a number */
export function parsePrice(price: string): number {
  const m = price.match(/[\d.,]+/);
  if (!m) return 0;
  const num = m[0].replace(/,/g, "");
  return Number(num) || 0;
}
