"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

type ProductItem = { name: string; price: string; category: string; image: string; slug: string };

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

const DEFAULT_DESCRIPTION =
  "Handcrafted from full-grain Italian leather, designed for the modern journey. Featuring a spacious interior, brass hardware, and a timeless silhouette that ages beautifully.";
const DEFAULT_DETAILS = [
  "Full-grain Italian leather",
  "Solid brass hardware",
  "Interior zip pocket",
  "15\" laptop sleeve",
  "Handmade in Cape Town",
];

function ProductMainSection({
  product,
  description,
  details,
}: {
  product: ProductItem;
  description: string;
  details: string[];
}) {
  const { addToCart } = useCart();

  const images = [
    product.image,
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=85&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85&fit=crop",
  ];

  return (
    <div className="mx-auto max-w-[1920px] px-6 py-12 md:px-12 pt-24 md:pt-32">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left: Gallery Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {images.map((img, i) => (
              <div key={i} className={`relative bg-gray-100 ${i === 0 ? "aspect-[4/5] md:col-span-2" : "aspect-[3/4]"}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sticky Details (Classic Split style) */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:h-fit lg:pl-12">
          <span className="text-xs uppercase tracking-widest text-gray-500">{product.category}</span>
          <h1 className="mt-4 text-4xl font-light text-black md:text-5xl" style={serif}>
            {product.name}
          </h1>
          <p className="mt-4 text-xl text-black/70">{product.price}</p>
          <p className="mt-8 text-sm leading-relaxed text-black/70">{description}</p>
          
          <div className="mt-10 space-y-4 border-t border-black/10 pt-8">
            {details.map((detail) => (
              <div key={detail} className="flex items-center gap-3 text-sm text-black/60">
                <span className="h-1 w-1 rounded-full bg-black/40" />
                {detail}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addToCart({ slug: product.slug, name: product.name, price: product.price, image: product.image })}
            className="mt-12 w-full bg-black py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black/90 transition-colors"
          >
            Add to Cart
          </button>

          {/* Shipping & Returns */}
          <div className="mt-12 space-y-6 border-t border-black/10 pt-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-2">Shipping</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                Complimentary global shipping on all orders. Each piece is made to order and ships within 2-3 weeks.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-2">Returns</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                We accept returns within 14 days of delivery. Items must be unused and in original packaging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StorySection() {
  return (
    <div className="w-full">
      {/* 4. Atelier: Behind the scenes */}
      <section className="py-24 md:py-32 text-center" style={bgWhite}>
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6 block">The Atelier</span>
          <h2 className="text-5xl md:text-7xl font-light mb-16" style={serif}>Where magic happens.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div className="relative aspect-square bg-gray-100">
              <Image src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=1000&q=85&fit=crop" alt="Atelier 1" fill className="object-cover" />
            </div>
            <div className="relative aspect-square bg-gray-100">
              <Image src="https://images.unsplash.com/photo-1618331835717-801e976710b2?w=1000&q=85&fit=crop" alt="Atelier 2" fill className="object-cover" />
            </div>
          </div>
          <p className="mt-16 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
            "We don't just make bags; we engineer heirlooms. Our atelier is a place of quiet focus, where tradition meets innovation."
          </p>
        </div>
      </section>

      {/* 5. Interview: Q&A style */}
      <section className="py-24 md:py-32 border-t border-black/5" style={bgWhite}>
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-24 h-24 relative shrink-0 rounded-full overflow-hidden bg-gray-100">
               <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=85&fit=crop" alt="Designer" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-light mb-12" style={serif}>In conversation with the designer</h2>
              <div className="space-y-12">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-black/40">Q: What inspired this collection?</p>
                  <p className="text-lg text-black/80 leading-relaxed font-light">
                    "I wanted to capture the essence of the South African landscape—the raw textures, the warm earth tones. It's about grounding yourself in something real and tangible."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-black/40">Q: Why full-grain leather?</p>
                  <p className="text-lg text-black/80 leading-relaxed font-light">
                    "Because it lives. It breathes. It changes with you. Synthetic materials stay the same, but leather tells a story. I want our bags to look better in ten years than they do today."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-24 flex items-center justify-center" style={bgWhite}>
        <p className="text-neutral-500" style={serif}>Loading…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 pb-24" style={bgWhite}>
        <div className="mx-10 md:mx-20 text-center">
          <h1 className="text-2xl font-light text-black" style={serif}>Product not found</h1>
          <Link href="/shop" className="mt-4 inline-block text-sm underline text-neutral-600 hover:text-black">Back to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20" style={bgWhite}>
      <ProductMainSection
        product={product}
        description={DEFAULT_DESCRIPTION}
        details={DEFAULT_DETAILS}
      />
      <StorySection />
    </main>
  );
}
