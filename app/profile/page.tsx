import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

function ProfileFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white pb-24 pt-24" dir="rtl">
      <p className="text-neutral-500" style={{ fontFamily: "var(--font-playpen-arabic), sans-serif" }}>
        جاري التحميل…
      </p>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
