"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type TabId = "hot" | "bestsellers" | "sale";

const TABS: { id: TabId; label: string }[] = [
  { id: "hot", label: "الأكثر رواجاً" },
  { id: "bestsellers", label: "الأكثر مبيعاً" },
  { id: "sale", label: "تخفيضات" },
];

type FeaturedCard = {
  slug: string;
  image: string;
  category: string;
  name: string;
  priceLine: "simple" | "sale";
  price: string;
  salePrice?: string;
};

/** Hardcoded showcase (Arabic). Slugs match shop products for working links. */
const PLACEHOLDER_PRODUCTS: FeaturedCard[] = [
  {
    slug: "signature-tote",
    image: "/losing_weigh_herbs.png",
    category: "أعشاب",
    name: "خلطة أعشاب طبيعية",
    priceLine: "simple",
    price: "242.00 ر.س",
  },
  {
    slug: "leather-crossbody",
    image: "/Item pictures/basket_bag-removebg-preview.png",
    category: "زيت",
    name: "تونر أساسي",
    priceLine: "simple",
    price: "189.00 ر.س",
  },
  {
    slug: "travel-weekender",
    image: "/Item pictures/Black_bag-removebg-preview.png",
    category: "سيروم",
    name: "سيروم نضارة البشرة",
    priceLine: "sale",
    salePrice: "78.00 ر.س",
    price: "119.00 ر.س",
  },
  {
    slug: "evening-clutch",
    image: "/Item pictures/Blue_bag-removebg-preview.png",
    category: "كريم",
    name: "كريم بيو ريتينول",
    priceLine: "sale",
    salePrice: "145.00 ر.س",
    price: "207.00 ر.س",
  },
  {
    slug: "classic-satchel",
    image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    category: "عناية",
    name: "حقيبة يومية كلاسيكية",
    priceLine: "simple",
    price: "298.00 ر.س",
  },
  {
    slug: "leather-bucket-bag",
    image: "/Item pictures/orange_bag-removebg-preview.png",
    category: "ماسك",
    name: "ماسك ترطيب عميق",
    priceLine: "simple",
    price: "165.00 ر.س",
  },
  {
    slug: "structured-shoulder",
    image: "/Item pictures/snake_skin_bag-removebg-preview.png",
    category: "سيروم",
    name: "سيروم فيتامين سي",
    priceLine: "simple",
    price: "210.00 ر.س",
  },
  {
    slug: "mini-tote",
    image: "/losing_weigh_herbs.png",
    category: "تنظيف",
    name: "غسول لطيف للوجه",
    priceLine: "simple",
    price: "95.00 ر.س",
  },
];

function ProductCard({ item }: { item: FeaturedCard }) {
  return (
    <Link href={`/product/${item.slug}`} className="group flex flex-col">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-neutral-100 p-4 sm:p-5 md:p-6 lg:p-7">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain object-center p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4 md:p-5"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500">{item.category}</span>
        <span className="text-sm font-semibold text-neutral-900">{item.name}</span>
        {item.priceLine === "simple" && <span className="text-sm text-neutral-900">{item.price}</span>}
        {item.priceLine === "sale" && item.salePrice && (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-medium text-red-600">من {item.salePrice}</span>
            <span className="text-xs text-neutral-400 line-through">{item.price}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function FeaturedProductsSection() {
  const [active, setActive] = useState<TabId>("bestsellers");

  return (
    <section className="w-full bg-white py-12 md:py-16" aria-label="منتجات مميزة" dir="rtl">
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="mb-10 flex flex-col items-center gap-8 text-center">
          <h2 className="max-w-2xl text-xl font-normal leading-snug italic text-neutral-800 md:text-2xl">
            <span>مختاراتنا </span>
            <span>لموسم العطلات</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-[#F5F5F5] text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {PLACEHOLDER_PRODUCTS.map((item) => (
            <ProductCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
