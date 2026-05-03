"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { adminIconClassName } from "@/lib/page-theme";

export function AdminLogoutButton() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-black"
      >
        <LogOut className={`h-4 w-4 ${adminIconClassName}`} strokeWidth={1.5} aria-hidden />
        تسجيل الخروج
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج من لوحة الإدارة؟"
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        danger
        busy={busy}
        onConfirm={handleLogout}
        onCancel={() => {
          if (!busy) setConfirmOpen(false);
        }}
      />
    </>
  );
}
