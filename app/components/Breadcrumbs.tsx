import Link from "next/link";
import { sans } from "@/lib/page-theme";

export type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** `light`: white/soft text for dark image backgrounds (shop banner, etc.) */
  variant?: "default" | "light";
  className?: string;
};

export function Breadcrumbs({ items, variant = "default", className = "" }: BreadcrumbsProps) {
  const light = variant === "light";
  return (
    <nav
      aria-label="مسار التنقل"
      className={`${light ? "mb-3" : "mb-8"} ${className}`.trim()}
      dir="rtl"
    >
      <ol
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${light ? "text-white/80" : ""}`.trim()}
        style={sans}
      >
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className={`select-none ${light ? "text-white/40" : "text-neutral-300"}`}
                aria-hidden
              >
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={
                  light
                    ? "text-white/85 transition-colors hover:text-white"
                    : "text-neutral-500 transition-colors hover:text-neutral-900"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-medium ${light ? "text-white" : "text-neutral-900"}`}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
