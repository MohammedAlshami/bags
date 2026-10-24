import { normalizeCode } from "@/lib/discount-codes";

export type DiscountInput = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

function dateOrNull(v: unknown): string | null | undefined {
  if (v == null || v === "") return null;
  const t = Date.parse(String(v));
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

export function parseDiscountBody(
  body: Record<string, unknown>,
): { ok: true; data: DiscountInput } | { ok: false; error: string } {
  const code = normalizeCode(String(body.code ?? ""));
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return { ok: false, error: "الكود يجب أن يكون من 3 إلى 32 حرفاً إنجليزياً أو رقماً" };
  }
  const type = body.type === "fixed" ? "fixed" : "percent";
  const value = Number(body.value);
  if (!Number.isFinite(value) || value <= 0 || (type === "percent" && value > 100)) {
    return { ok: false, error: type === "percent" ? "النسبة يجب أن تكون بين 1 و100" : "قيمة الخصم غير صالحة" };
  }
  const minSubtotal = body.minSubtotal === "" || body.minSubtotal == null ? 0 : Number(body.minSubtotal);
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) return { ok: false, error: "الحد الأدنى غير صالح" };
  const maxUses = body.maxUses === "" || body.maxUses == null ? null : Math.floor(Number(body.maxUses));
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    return { ok: false, error: "عدد مرات الاستخدام غير صالح" };
  }
  const startsAt = dateOrNull(body.startsAt);
  const expiresAt = dateOrNull(body.expiresAt);
  if (startsAt === undefined || expiresAt === undefined) return { ok: false, error: "التاريخ غير صالح" };
  return {
    ok: true,
    data: { code, type, value, minSubtotal, maxUses, startsAt, expiresAt, isActive: body.isActive !== false },
  };
}
