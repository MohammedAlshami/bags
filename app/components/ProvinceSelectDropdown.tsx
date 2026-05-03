"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sans } from "@/lib/page-theme";
import { CHECKOUT_PROVINCES, getCheckoutProvinceById } from "@/lib/checkout-provinces";

export function ProvinceSelectDropdown({
  id,
  value,
  onChange,
  placeholder = "اختيار المحافظة",
}: {
  id: string;
  value: string;
  onChange: (provinceId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = getCheckoutProvinceById(value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = selected?.label ?? placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl bg-neutral-50 px-3 py-3 text-start text-sm text-neutral-900 ring-1 ring-neutral-200/80 transition-[box-shadow,ring-color] hover:ring-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/35"
        style={sans}
      >
        <span className="min-w-0 flex-1 leading-snug">{label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          className="absolute start-0 top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl bg-white py-1 ring-1 ring-neutral-200/90"
        >
          {CHECKOUT_PROVINCES.map((p) => {
            const isSel = p.id === value;
            return (
              <li key={p.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-start text-sm leading-snug transition-colors ${
                    isSel ? "bg-brand-light/45 font-medium text-brand-dark" : "text-neutral-800 hover:bg-neutral-50"
                  }`}
                  style={sans}
                >
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
