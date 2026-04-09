"use client";

import Link from "next/link";
import { Package, UserCircle, LogOut, ChevronLeft } from "lucide-react";
import { sans } from "@/lib/page-theme";

/** Lucide stroke icons — matches landing accent */
export const profileAccentIcon = "text-[#B63A6B] shrink-0";

type NavCurrent = "orders" | "billing";

type ProfileBreadcrumbItem = { label: string; href?: string };

export function ProfileBreadcrumb({ items }: { items: ProfileBreadcrumbItem[] }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500" aria-label="مسار التنقل" style={sans}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
          {i > 0 ? <span className="text-neutral-300 select-none" aria-hidden>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[#B63A6B]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-neutral-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function NavRow({
  active,
  href,
  label,
  icon,
}: {
  active: boolean;
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const className = [
    "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors md:shrink md:whitespace-normal md:px-4",
    active ? "bg-[#FCF0F2] font-semibold text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
  ].join(" ");

  const inner = (
    <>
      <span className={profileAccentIcon}>{icon}</span>
      {label}
      <ChevronLeft className="ms-auto h-4 w-4 text-neutral-400 md:hidden" strokeWidth={1.5} />
    </>
  );

  if (active) {
    return (
      <span className={className} style={sans}>
        {inner}
      </span>
    );
  }
  return (
    <Link href={href} className={className} style={sans}>
      {inner}
    </Link>
  );
}

type ProfileAccountNavProps = {
  current: NavCurrent;
  onLogout: () => void;
};

export function ProfileAccountNav({ current, onLogout }: ProfileAccountNavProps) {
  return (
    <nav
      className="hide-scrollbar flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0"
      aria-label="قائمة الحساب"
    >
      <NavRow
        active={current === "orders"}
        href="/profile"
        label="طلباتي"
        icon={<Package className="h-5 w-5" strokeWidth={1.35} />}
      />
      <NavRow
        active={current === "billing"}
        href="/profile?tab=billing"
        label="بياناتي"
        icon={<UserCircle className="h-5 w-5" strokeWidth={1.35} />}
      />
      <button
        type="button"
        onClick={onLogout}
        className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-start text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 md:mt-3 md:w-full md:shrink md:whitespace-normal md:px-4"
        style={sans}
      >
        <LogOut className={`h-5 w-5 ${profileAccentIcon}`} strokeWidth={1.35} />
        تسجيل الخروج
      </button>
    </nav>
  );
}
