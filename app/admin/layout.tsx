import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminTabs } from "./AdminTabs";
import { AdminLogoutButton } from "./AdminLogoutButton";
import Link from "next/link";
import { Home } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
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
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex items-center justify-between pt-4 pb-2">
            <h1 className="text-2xl font-medium text-black">لوحة الإدارة</h1>
            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-black transition-colors"
              >
                <Home className={`w-4 h-4 ${adminIconClassName}`} strokeWidth={1.5} aria-hidden />
                العودة للموقع
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
          <AdminTabs />
        </div>
      </header>
      <main className="bg-white pt-32 pb-24 px-6 md:px-10">
        <div className="mx-auto max-w-6xl py-8 md:py-12 bg-white">{children}</div>
      </main>
    </div>
  );
}
