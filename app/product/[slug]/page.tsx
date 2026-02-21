"use client";

import { useState } from "react";
import Image from "next/image";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

// Mock data
const PRODUCT = {
  name: "The Signature Tote",
  price: "$1,280",
  description:
    "Handcrafted from full-grain Italian leather, the Signature Tote is designed for the modern journey. Featuring a spacious interior, brass hardware, and a timeless silhouette that ages beautifully.",
  details: [
    "Full-grain Italian leather",
    "Solid brass hardware",
    "Interior zip pocket",
    "15\" laptop sleeve",
    "Handmade in Cape Town",
  ],
  images: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=85&fit=crop",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=85&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=85&fit=crop",
  ],
};

function ProductMainSection() {
  return (
    <div className="mx-auto max-w-[1920px] px-6 py-12 md:px-12 pt-24 md:pt-32">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left: Gallery Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PRODUCT.images.map((img, i) => (
              <div key={i} className={`relative bg-gray-100 ${i === 0 ? "aspect-[4/5] md:col-span-2" : "aspect-[3/4]"}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sticky Details (Classic Split style) */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:h-fit lg:pl-12">
          <span className="text-xs uppercase tracking-widest text-gray-500">Handbags</span>
          <h1 className="mt-4 text-4xl font-light text-black md:text-5xl" style={serif}>
            {PRODUCT.name}
          </h1>
          <p className="mt-4 text-xl text-black/70">{PRODUCT.price}</p>
          <p className="mt-8 text-sm leading-relaxed text-black/70">{PRODUCT.description}</p>
          
          <div className="mt-10 space-y-4 border-t border-black/10 pt-8">
            {PRODUCT.details.map((detail) => (
              <div key={detail} className="flex items-center gap-3 text-sm text-black/60">
                <span className="h-1 w-1 rounded-full bg-black/40" />
                {detail}
              </div>
            ))}
          </div>

          <button className="mt-12 w-full bg-black py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black/90 transition-colors">
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
  return (
    <main className="min-h-screen pt-20" style={bgWhite}>
      {/* Main Product Section (Fixed Layout) */}
      <ProductMainSection />

      {/* Story Section (Long Scroll) */}
      <StorySection />
    </main>
  );
}
