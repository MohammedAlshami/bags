import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminTabs } from "./AdminTabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin navbar: fixed top bar, separate from main site */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex items-center justify-between pt-4 pb-2">
            <h1 className="text-2xl font-light text-black" style={serif}>
              Admin
            </h1>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back to site
            </Link>
          </div>
          <AdminTabs />
        </div>
      </header>
      <main className="pt-32 pb-24 px-6 md:px-10">
        <div className="mx-auto max-w-6xl py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
