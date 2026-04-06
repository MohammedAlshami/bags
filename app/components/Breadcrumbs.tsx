import Link from "next/link";
import { sans } from "@/lib/page-theme";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسار التنقل" className="mb-8" dir="rtl">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" style={sans}>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-neutral-300 select-none" aria-hidden>
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="text-neutral-500 transition-colors hover:text-neutral-900">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-neutral-900" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
