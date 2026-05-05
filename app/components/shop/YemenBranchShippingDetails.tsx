import { sans } from "@/lib/page-theme";

const PRIMARY_LINES = [
  { emoji: "🚚", text: "التوصيل: لكل المحافظات" },
  { emoji: "⚡", text: "توصيل نفس اليوم أو اليوم التالي" },
  { emoji: "💵", text: "الدفع عند الاستلام" },
  { emoji: "💲", text: "التوصيل: 800 ريال" },
] as const;

const OTHER_GOVERNORATES_LINES = [
  { emoji: "💳", text: "الدفع حوالة" },
  { emoji: "⏳", text: "مدة التوصيل: 2–5 أيام" },
  { emoji: "📦", text: "الشحن عبر مكتب القدسي أو السلمي" },
] as const;

function LineRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="shrink-0 select-none" aria-hidden>
        {emoji}
      </span>
      <span>{text}</span>
    </li>
  );
}

/** فرع اليمن — نص الشحن الموحّد لصفحات المنتج والباقة */
export function YemenBranchShippingDetails() {
  return (
    <div className="space-y-4" style={sans}>
      <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-600 md:text-base">
        {PRIMARY_LINES.map((row) => (
          <LineRow key={row.text} emoji={row.emoji} text={row.text} />
        ))}
      </ul>
      <p className="text-sm font-semibold text-neutral-900">بقية المحافظات:</p>
      <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-600 md:text-base">
        {OTHER_GOVERNORATES_LINES.map((row) => (
          <LineRow key={row.text} emoji={row.emoji} text={row.text} />
        ))}
      </ul>
    </div>
  );
}
