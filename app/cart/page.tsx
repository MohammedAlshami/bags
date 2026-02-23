"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="mx-10 md:mx-20">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">
            Shopping bag
          </p>
          <h1 className="mt-2 text-4xl font-light text-neutral-900 md:text-5xl" style={serif}>
            Your cart
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-600 mb-6" style={serif}>
              Your cart is empty.
            </p>
            <Link
              href="/shop"
              className="inline-block border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-8">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex gap-6 border-b border-neutral-100 pb-8"
                >
                  <div className="relative h-32 w-28 shrink-0 overflow-hidden bg-neutral-50 md:h-40 md:w-32">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-base font-medium text-black">
                          {item.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {item.price}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="shrink-0 text-xs uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <label htmlFor={`qty-${item.slug}`} className="text-xs uppercase tracking-widest text-neutral-500">
                        Qty
                      </label>
                      <select
                        id={`qty-${item.slug}`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.slug, Number(e.target.value))
                        }
                        className="border border-neutral-200 bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
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
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Subtotal
                </p>
                <p className="mt-2 text-2xl font-light text-black" style={serif}>
                  {formatPrice(subtotal)}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <button
                  type="button"
                  className="mt-6 w-full bg-black py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black/90 transition-colors"
                >
                  Checkout (coming soon)
                </button>
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-sm text-neutral-600 underline hover:text-black"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
