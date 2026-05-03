import { Suspense } from "react";
import ProfileContent from "./ProfileContent";

function ProfileFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:pt-6 md:pt-14 lg:pt-20 md:pb-32" dir="rtl">
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
