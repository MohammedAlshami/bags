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
  { id: "sanaa-al-kumaym", name: "الكميم – الربيع نسمة", city: "صنعاء", country: "اليمن", lat: 15.3694, lon: 44.191 },
  { id: "sanaa-max-city", name: "ماكس سيتي بجانب الستين – تاتشز", city: "صنعاء", country: "اليمن", lat: 15.3789, lon: 44.2138 },
  { id: "sanaa-flora", name: "مول الزهراء مركز وير نايس جوار السكنيه المدينه - سعوان فلورا", city: "صنعاء", country: "اليمن", lat: 15.3982, lon: 44.2306 },
  { id: "al-madinah-you-for-you", name: "مول سيتي – أنتِ لكِ (الدور الثاني)", city: "المدينة", country: "اليمن", lat: 16.31, lon: 42.77 },
  { id: "marib-star", name: "شارع سنتر، سيتي مول – ستار الطيف", city: "مأرب", country: "اليمن", lat: 15.47, lon: 45.32 },
  { id: "ataq-mariam", name: "خط المرور شارع الأول، الدور البلد، سوق – مريم", city: "عتق", country: "اليمن", lat: 14.55, lon: 46.83 },
  { id: "ib-paris-rose", name: "التجاري جرعان مجمع العدين، شارع – باريس روز", city: "إب", country: "اليمن", lat: 13.97, lon: 44.18 },
  { id: "mukalla-mqayl", name: "لذهب العماري مقاييل صبايا", city: "المكلا", country: "اليمن", lat: 14.5425, lon: 49.1242 },
  { id: "al-mahra-sabaya", name: "جب وادي ومحلات باصفار مسجد جانب النساء سوق صبايا-", city: "المهرة", country: "اليمن", lat: 16.73, lon: 52.83 },
  { id: "al-hudaydah-ameer", name: "للصرافه حريش شركةبن أمام صدام _شارع الرافدين أمير محل", city: "الحديدة", country: "اليمن", lat: 14.797, lon: 42.95 },
  { id: "aden-albayraq", name: "٥٠ شارع المنصورة مول العطور-البيرق •أطياف", city: "عدن", country: "اليمن", lat: 12.8, lon: 45.03 },
  { id: "omran-al-babily", name: "للخياطه البابلي جوار البابلي سوق عمران", city: "عمران", country: "اليمن", lat: 15.66, lon: 43.94 },
  { id: "dhamar-al-majid", name: "بلقيس مدرسة أمام المعارض شارع ذمار للعطور الماجد", city: "ذمار", country: "اليمن", lat: 14.55, lon: 44.38 },
  { id: "taiz-al-huban", name: "واالمسبح الحوبان / بالفرعين السحريه القوه محل الشميري مطعم مقابل المسبح المدينه الثاني الدور مول الجوهره مركز الحوبان", city: "تعز", country: "اليمن", lat: 13.58, lon: 44.02 },
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
