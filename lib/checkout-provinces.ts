/** Checkout province → legacy cityScope for pricing / delivery rules */
export type CheckoutCityScope = "sanaa" | "outside";

export type CheckoutProvince = {
  id: string;
  label: string;
  cityScope: CheckoutCityScope;
};

/** محافظة صنعاء وحدة تستخدم منطق التوصيل المباشر/الاستلام؛ باقي المحافظات منطق الشحن للمحافظات. */
export const CHECKOUT_PROVINCES: CheckoutProvince[] = [
  { id: "sanaa", label: "صنعاء", cityScope: "sanaa" },
  { id: "aden", label: "عدن", cityScope: "outside" },
  { id: "taiz", label: "تعز", cityScope: "outside" },
  { id: "hudaydah", label: "الحديدة", cityScope: "outside" },
  { id: "ibb", label: "إب", cityScope: "outside" },
  { id: "dhamar", label: "ذمار", cityScope: "outside" },
  { id: "mahwit", label: "المحويت", cityScope: "outside" },
  { id: "hajjah", label: "حجة", cityScope: "outside" },
  { id: "omran", label: "عمران", cityScope: "outside" },
  { id: "jawf", label: "الجوف", cityScope: "outside" },
  { id: "marib", label: "مأرب", cityScope: "outside" },
  { id: "bayda", label: "البيضاء", cityScope: "outside" },
  { id: "raymah", label: "ريمة", cityScope: "outside" },
  { id: "lahij", label: "لحج", cityScope: "outside" },
  { id: "abyan", label: "أبين", cityScope: "outside" },
  { id: "dhale", label: "الضالع", cityScope: "outside" },
  { id: "shabwah", label: "شبوة", cityScope: "outside" },
  { id: "hadramawt", label: "حضرموت", cityScope: "outside" },
  { id: "mahrah", label: "المهرة", cityScope: "outside" },
  { id: "socotra", label: "أرخبيل سقطرى", cityScope: "outside" },
];

/** يُقبل في الطلبات القديمة أو الروابط المحفوظة */
const LEGACY_PROVINCE_ID: Record<string, string> = {
  "amana-sanaa": "sanaa",
  "sanaa-gov": "sanaa",
};

export function normalizeCheckoutProvinceId(id: string): string {
  const t = id.trim();
  return LEGACY_PROVINCE_ID[t] ?? t;
}

export function getCheckoutProvinceById(id: string): CheckoutProvince | undefined {
  const normalized = normalizeCheckoutProvinceId(id);
  return CHECKOUT_PROVINCES.find((p) => p.id === normalized);
}

export function isValidCheckoutProvinceId(id: string): boolean {
  return CHECKOUT_PROVINCES.some((p) => p.id === normalizeCheckoutProvinceId(id));
}
