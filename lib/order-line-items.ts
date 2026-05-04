import { parsePrice } from "@/lib/cart";
import { isUuid } from "@/lib/id";

/** Stored on orders as JSON; supports legacy `price` string rows. */
export type OrderLineItem = {
  slug: string;
  name: string;
  quantity: number;
  saudiRiyal?: number;
  /** Legacy rows */
  price?: string;
  oldRiyal?: number | null;
  image?: string;
};

export function getOrderLineSar(item: OrderLineItem): number {
  if (typeof item.saudiRiyal === "number" && Number.isFinite(item.saudiRiyal)) {
    return item.saudiRiyal;
  }
  return parsePrice(String(item.price ?? ""));
}

/** Lenient parse for list UIs — skips invalid rows, never throws. */
export type OrderLinePreview = {
  name: string;
  quantity: number;
  image?: string;
};

export function parseOrderLineItemsLenient(raw: unknown): OrderLinePreview[] {
  if (!Array.isArray(raw)) return [];
  const out: OrderLinePreview[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const q = typeof o.quantity === "number" ? o.quantity : parseInt(String(o.quantity ?? ""), 10);
    const quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 0;
    if (!name || quantity < 1) continue;
    const image = typeof o.image === "string" ? o.image.trim() : "";
    out.push(image ? { name, quantity, image } : { name, quantity });
  }
  return out;
}

/** Collect product/package ids from stored order line JSON (`slug` is catalog id). */
export function collectSlugsFromOrderItemsJson(raw: unknown): string[] {
  const set = new Set<string>();
  if (!Array.isArray(raw)) return [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const slug = typeof (entry as Record<string, unknown>).slug === "string"
      ? (entry as Record<string, unknown>).slug.trim()
      : "";
    if (slug && isUuid(slug)) set.add(slug);
  }
  return [...set];
}

export type CatalogLineMeta = { name: string; image: string };

/** Fill missing `name` / `image` on each line from catalog (products table, then packages). */
export function enrichOrderItemsWithCatalog(
  raw: unknown,
  catalog: ReadonlyMap<string, CatalogLineMeta>,
): unknown {
  if (!Array.isArray(raw)) return raw;
  return raw.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const o = entry as Record<string, unknown>;
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    const cat = slug ? catalog.get(slug) : undefined;
    if (!cat) return entry;
    const next: Record<string, unknown> = { ...o };
    const haveName = typeof next.name === "string" && String(next.name).trim() !== "";
    const haveImage = typeof next.image === "string" && String(next.image).trim() !== "";
    if (!haveName && cat.name) next.name = cat.name;
    if (!haveImage && cat.image) next.image = cat.image;
    return next;
  });
}

/** Stable list shape for profile / order summaries (after enrichment). */
export function orderItemsToProductSummaries(raw: unknown): Array<{
  slug: string;
  name: string;
  quantity: number;
  image: string | null;
  saudiRiyal?: number;
}> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{
    slug: string;
    name: string;
    quantity: number;
    image: string | null;
    saudiRiyal?: number;
  }> = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const q = typeof o.quantity === "number" ? o.quantity : parseInt(String(o.quantity ?? ""), 10);
    const quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 0;
    if (!slug || !name || quantity < 1) continue;
    const imgRaw = typeof o.image === "string" ? o.image.trim() : "";
    const image = imgRaw.length > 0 ? imgRaw : null;
    const sarRaw = o.saudiRiyal;
    const sar =
      typeof sarRaw === "number" && Number.isFinite(sarRaw) ? sarRaw : undefined;
    const line: {
      slug: string;
      name: string;
      quantity: number;
      image: string | null;
      saudiRiyal?: number;
    } = { slug, name, quantity, image };
    if (sar !== undefined) line.saudiRiyal = sar;
    out.push(line);
  }
  return out;
}

export function normalizeOrderLineItems(raw: unknown): OrderLineItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("Invalid items");
  }
  if (raw.length === 0) {
    throw new Error("Items required");
  }
  const out: OrderLineItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const image = typeof o.image === "string" ? o.image.trim() : "";
    const q = typeof o.quantity === "number" ? o.quantity : parseInt(String(o.quantity ?? ""), 10);
    const quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 0;
    const saudiRiyalRaw = o.saudiRiyal;
    const priceStr = typeof o.price === "string" ? o.price.trim() : "";
    const sar =
      typeof saudiRiyalRaw === "number" && Number.isFinite(saudiRiyalRaw)
        ? saudiRiyalRaw
        : priceStr
          ? parsePrice(priceStr)
          : NaN;
    if (!slug || !name || quantity < 1 || !Number.isFinite(sar) || sar < 0) {
      throw new Error("Invalid items");
    }
    const oldRiyal =
      o.oldRiyal == null || o.oldRiyal === "" ? null : Number(o.oldRiyal);
    const line: OrderLineItem = {
      slug,
      name,
      quantity,
      saudiRiyal: sar,
      ...(oldRiyal != null && Number.isFinite(oldRiyal) ? { oldRiyal } : {}),
      ...(priceStr && typeof saudiRiyalRaw !== "number" ? { price: priceStr } : {}),
    };
    if (image) line.image = image;
    out.push(line);
  }
  if (out.length === 0) throw new Error("Invalid items");
  return out;
}
