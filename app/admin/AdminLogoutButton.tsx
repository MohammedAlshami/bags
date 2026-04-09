"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminIconClassName } from "@/lib/page-theme";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-black transition-colors"
    >
      <LogOut className={`w-4 h-4 ${adminIconClassName}`} strokeWidth={1.5} aria-hidden />
      تسجيل الخروج
    </button>
  );
}
