"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { sans, pagePaddingX } from "@/lib/page-theme";

function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " ر.س"
  );
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="mb-8">
          <p className="text-xs text-neutral-500" style={sans}>
            السلة
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            سلّتك
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-6 text-neutral-600" style={sans}>
              السلة فارغة.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full border border-neutral-900 bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              style={sans}
            >
              متابعة التسوق
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-8">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-6 border-b border-neutral-100 pb-8">
                  <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-[#FCF0F2] md:h-40 md:w-32">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="128px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-neutral-900" style={sans}>
                          {item.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-neutral-500" style={sans}>
                          {item.price}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="shrink-0 text-xs text-neutral-400 transition-colors hover:text-black"
                        style={sans}
                        aria-label={`إزالة ${item.name} من السلة`}
                      >
                        إزالة
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <label htmlFor={`qty-${item.slug}`} className="text-xs text-neutral-500" style={sans}>
                        الكمية
                      </label>
                      <select
                        id={`qty-${item.slug}`}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.slug, Number(e.target.value))}
                        className="border border-neutral-200 bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        style={sans}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 lg:w-80">
              <div className="sticky top-32 border-t border-neutral-200 pt-8">
                <p className="text-xs text-neutral-500" style={sans}>
                  المجموع الفرعي
                </p>
                <p className="mt-2 text-2xl font-medium text-neutral-900" style={sans}>
                  {formatSar(subtotal)}
                </p>
                <p className="mt-2 text-xs text-neutral-500" style={sans}>
                  الشحن والضرائب تُحسب عند إتمام الطلب.
                </p>
                <button
                  type="button"
                  className="mt-6 w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  style={sans}
                >
                  إتمام الطلب (قريباً)
                </button>
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-sm text-neutral-600 underline-offset-2 hover:text-black hover:underline"
                  style={sans}
                >
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
