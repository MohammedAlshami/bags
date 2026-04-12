import Link from "next/link";
import { redirect } from "next/navigation";
import { Home } from "lucide-react";

import { getSession } from "@/lib/auth";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { AdminTabs } from "./AdminTabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen bg-white [&_a]:cursor-pointer [&_button:not(:disabled)]:cursor-pointer [&_[role=button]]:cursor-pointer [&_select]:cursor-pointer [&_summary]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:transition-colors [&_button:not(:disabled)]:transition-[filter,opacity,box-shadow] [&_button:not(:disabled)]:duration-150"
      dir="rtl"
      style={sans}
    >
      <header className="fixed left-0 right-0 top-0 z-50 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
          <div className="flex flex-col gap-3 pt-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl font-medium text-black sm:text-2xl">لوحة الإدارة</h1>
            <div className="flex items-center justify-between gap-3 lg:justify-end lg:gap-5">
              <Link href="/" className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-black">
                <Home className={`h-4 w-4 ${adminIconClassName}`} strokeWidth={1.5} aria-hidden />
                العودة للموقع
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
          <AdminTabs />
        </div>
      </header>
      <main className="bg-white px-4 pb-28 pt-28 sm:px-6 sm:pb-30 sm:pt-32 md:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-6xl bg-white py-6 sm:py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
