export type StoreLocation = {
  /** Stable key stored on orders (e.g. `branch_key` in DB). */
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

export const STORE_LOCATIONS: StoreLocation[] = [
  { id: "jeddah-sanabel", name: "فرع السنابل - جدة", city: "جدة", country: "السعودية", lat: 21.4858, lon: 39.1925 },
  { id: "makkah-awali", name: "فرع العوالي - مكة", city: "مكة", country: "السعودية", lat: 21.3891, lon: 39.8579 },
  { id: "madinah-arid", name: "فرع العريض - المدينة المنورة", city: "المدينة المنورة", country: "السعودية", lat: 24.5247, lon: 39.5692 },
  { id: "sanaa-tahrir", name: "صنعاء - التحرير", city: "صنعاء", country: "اليمن", lat: 15.3694, lon: 44.191 },
  { id: "aden-carter", name: "عدن - كريتر", city: "عدن", country: "اليمن", lat: 12.7797, lon: 45.0367 },
  { id: "taiz-jamal", name: "تعز - شارع جمال", city: "تعز", country: "اليمن", lat: 13.5795, lon: 44.0209 },
  { id: "mukalla-diss", name: "المكلا - الديس", city: "المكلا", country: "اليمن", lat: 14.5425, lon: 49.1242 },
];

export function getStoreLocationById(id: string): StoreLocation | undefined {
  return STORE_LOCATIONS.find((b) => b.id === id);
}

export function isValidBranchKey(id: string): boolean {
  return STORE_LOCATIONS.some((b) => b.id === id);
}

export function buildMapEmbedUrl(lat: number, lon: number) {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=13&output=embed`;
}

export function buildGoogleMapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}
