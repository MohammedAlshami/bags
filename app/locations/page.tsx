import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { LocationsAlternatingLayout } from "@/app/components/locations/LocationsAlternatingLayout";
import { pagePaddingX, sans, serif } from "@/lib/page-theme";

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-white pb-20 pt-20 md:pb-28 md:pt-24" dir="rtl">
      <div className={pagePaddingX}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "فروعنا" }]} />
        <header className="mx-auto max-w-3xl pb-10 pt-4 text-center md:pb-14 md:pt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-4xl" style={serif}>
            فروعنا في السعودية واليمن
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            مواقعنا تمتد من المملكة إلى اليمن — اختاري الفرع واطّلعي على موقعه على الخريطة.
          </p>
        </header>
      </div>

      <LocationsAlternatingLayout />
    </main>
  );
}
