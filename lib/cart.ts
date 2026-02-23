export type CartItem = {
  slug: string;
  name: string;
  price: string;
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

/** Parse price string like "$1,280" to number */
export function parsePrice(price: string): number {
  const num = price.replace(/[$,]/g, "");
  return Number(num) || 0;
}
