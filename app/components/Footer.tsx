"use client";

import Link from "next/link";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

const FOOTER_LINKS = {
  shop: [
    { label: "All Bags", href: "#" },
    { label: "New Arrivals", href: "#" },
    { label: "Best Sellers", href: "#" },
    { label: "Gift Guide", href: "#" },
  ],
  help: [
    { label: "Contact", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Size Guide", href: "#" },
  ],
  company: [
    { label: "Our Story", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
};

const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "Facebook", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-black" style={bgWhite} role="contentinfo">
      <div className="mx-auto max-w-7xl border-l border-r border-black">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black">
          <div className="p-8 md:p-12 flex flex-col justify-between h-64 md:h-96">
            <span className="text-xs font-bold uppercase tracking-widest">Brand</span>
            <h2 className="text-4xl font-light leading-none" style={serif}>Carol<br />Bouwer</h2>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-between h-64 md:h-96">
             <span className="text-xs font-bold uppercase tracking-widest">Collection</span>
             <div className="flex flex-col gap-2">
               {FOOTER_LINKS.shop.map(l => <Link key={l.label} href={l.href} className="text-sm hover:text-black/60 transition-colors">{l.label}</Link>)}
             </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-between h-64 md:h-96">
             <span className="text-xs font-bold uppercase tracking-widest">Support</span>
             <div className="flex flex-col gap-2">
               {FOOTER_LINKS.help.map(l => <Link key={l.label} href={l.href} className="text-sm hover:text-black/60 transition-colors">{l.label}</Link>)}
             </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-between h-64 md:h-96">
             <span className="text-xs font-bold uppercase tracking-widest">Connect</span>
             <div className="flex flex-col gap-2">
               {SOCIAL.map(s => <Link key={s.label} href={s.href} className="text-sm hover:text-black/60 transition-colors">{s.label}</Link>)}
             </div>
          </div>
        </div>
        <div className="border-t border-black p-4 text-center">
           <p className="text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
