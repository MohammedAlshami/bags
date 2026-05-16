export type StoreLocation = {
  /** Stable key stored on orders (e.g. `branch_key` in DB). */
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone?: string;
  lat: number;
  lon: number;
};

/**
 * Shipping offices used at checkout for pickup / governorate orders.
 * Full {@link STORE_LOCATIONS} remains for the public locations page and legacy orders.
 */
export const CHECKOUT_PICKUP_POINTS: StoreLocation[] = [
  {
    id: "shipping-office-salmi",
    name: "مكتب الشحن — السلمي",
    city: "",
    country: "اليمن",
    address: "",
    lat: 15.3694,
    lon: 44.191,
  },
  {
    id: "shipping-office-qudsi",
    name: "مكتب الشحن — القدسي",
    city: "",
    country: "اليمن",
    address: "",
    lat: 15.3789,
    lon: 44.2138,
  },
];

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: "sanaa-al-kumaym",
    name: "نسمة الربيع",
    city: "صنعاء",
    country: "اليمن",
    address: "الكميم",
    lat: 15.3694,
    lon: 44.191,
  },
  {
    id: "sanaa-sixty-st",
    name: "تاتشز",
    city: "صنعاء",
    country: "اليمن",
    address: "شارع الستين (بجانب سيتي ماكس)",
    lat: 15.3789,
    lon: 44.2138,
  },
  {
    id: "sanaa-flora",
    name: "فلورا",
    city: "صنعاء",
    country: "اليمن",
    address: "سعوان — المدينة السكنية، جوار مركز وير نايس، مول الزهراء",
    lat: 15.3982,
    lon: 44.2306,
  },
  {
    id: "taiz-city-mall",
    name: "أنت لك",
    city: "تعز (المدينة)",
    country: "اليمن",
    address: "سيتي مول — الدور الثاني",
    phone: "776846456",
    lat: 13.5789,
    lon: 44.0209,
  },
  {
    id: "marib-star",
    name: "الطيف ستار",
    city: "مأرب",
    country: "اليمن",
    address: "سيتي مول سنتر — شارع الأربعين",
    phone: "780093653",
    lat: 15.47,
    lon: 45.32,
  },
  {
    id: "ataq-mariam",
    name: "مريم",
    city: "شبوة (عتق)",
    country: "اليمن",
    address: "سوق البلد — الدور الأول، شارع المرور، خط الثلاثين",
    phone: "737948953",
    lat: 14.55,
    lon: 46.83,
  },
  {
    id: "ib-paris-rose",
    name: "باريس روز",
    city: "إب",
    country: "اليمن",
    address: "شارع العدين — مجمع جرعان التجاري",
    phone: "777158717",
    lat: 13.97,
    lon: 44.18,
  },
  {
    id: "mukalla-sabaya",
    name: "صبايا",
    city: "المكلا",
    country: "اليمن",
    address: "مقابل العماري للذهب",
    phone: "730944448",
    lat: 14.5425,
    lon: 49.1242,
  },
  {
    id: "al-mahra-sabaya",
    name: "صبايا",
    city: "المهرة",
    country: "اليمن",
    address: "سوق النساء — بجانب مسجد باصفار ومحلات وادي جب",
    phone: "780044447",
    lat: 16.73,
    lon: 52.83,
  },
  {
    id: "al-hudaydah-ameer",
    name: "أمير الرافدين",
    city: "الحديدة",
    country: "اليمن",
    address: "شارع صدام — أمام شركة بن حريش للصرافة",
    phone: "772464139",
    lat: 14.797,
    lon: 42.95,
  },
  {
    id: "aden-albayraq",
    name: "أطياف العطور",
    city: "عدن",
    country: "اليمن",
    address: "المنصورة — البيرق مول، شارع 50",
    phone: "771203768",
    lat: 12.8,
    lon: 45.03,
  },
  {
    id: "omran-al-babily",
    name: "البابلي",
    city: "عمران",
    country: "اليمن",
    address: "سوق عمران — جوار البابلي للخياطة",
    phone: "774052218",
    lat: 15.66,
    lon: 43.94,
  },
  {
    id: "dhamar-al-majid",
    name: "الماجد للعطور",
    city: "ذمار",
    country: "اليمن",
    address: "شارع المعارض — أمام مدرسة بلقيس",
    phone: "777150077",
    lat: 14.55,
    lon: 44.38,
  },
  {
    id: "taiz-al-huban",
    name: "القوة السحرية",
    city: "تعز (الحوبان والمسبح)",
    country: "اليمن",
    address: "فرع المسبح: مقابل مطعم الشميري | فرع الحوبان: مركز الجوهرة مول، الدور الثاني",
    phone: "776329097",
    lat: 13.58,
    lon: 44.02,
  },
];

export function getStoreLocationById(id: string): StoreLocation | undefined {
  return CHECKOUT_PICKUP_POINTS.find((b) => b.id === id) ?? STORE_LOCATIONS.find((b) => b.id === id);
}

export function isValidBranchKey(id: string): boolean {
  return CHECKOUT_PICKUP_POINTS.some((b) => b.id === id) || STORE_LOCATIONS.some((b) => b.id === id);
}

export function buildMapEmbedUrl(lat: number, lon: number) {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=13&output=embed`;
}

export function buildGoogleMapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}
