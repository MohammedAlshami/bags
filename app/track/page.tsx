import { Suspense } from "react";
import TrackContent from "./TrackContent";

function TrackFallback() {
  return (
    <main className="min-h-screen bg-white py-16 md:py-24" dir="rtl">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-8 md:px-14 lg:px-24">
        <p className="text-neutral-500" style={{ fontFamily: "var(--font-playpen-arabic), sans-serif" }}>
          جاري التحميل…
        </p>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackFallback />}>
      <TrackContent />
    </Suspense>
  );
}
