import { sql } from "@/lib/db";
import type { DiscountRule } from "@/lib/order-discount";

export type DiscountCodeRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_subtotal: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: number;
  created_at: string;
};

export type DiscountCode = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

export function mapDiscountCode(row: DiscountCodeRow): DiscountCode {
  return {
    _id: row.id,
    code: row.code,
    type: row.type === "fixed" ? "fixed" : "percent",
    value: Number(row.value),
    minSubtotal: Number(row.min_subtotal ?? 0),
    maxUses: row.max_uses == null ? null : Number(row.max_uses),
    usedCount: Number(row.used_count ?? 0),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active === 1,
  };
}

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export type DiscountLookup =
  | { ok: true; rule: DiscountRule; id: string }
  | { ok: false; reason: "invalid" | "expired" | "exhausted" | "min_subtotal"; minSubtotal?: number };

/** Looks up a code and checks it is usable for this subtotal (does not consume a use). */
export async function lookupDiscountCode(rawCode: string, subtotal: number): Promise<DiscountLookup> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, reason: "invalid" };
  const rows = (await sql`SELECT * FROM discount_codes WHERE code = ${code} LIMIT 1`) as DiscountCodeRow[];
  const row = rows[0];
  if (!row || row.is_active !== 1) return { ok: false, reason: "invalid" };

  const now = Date.now();
  if (row.starts_at && Date.parse(row.starts_at) > now) return { ok: false, reason: "invalid" };
  if (row.expires_at && Date.parse(row.expires_at) < now) return { ok: false, reason: "expired" };
  if (row.max_uses != null && row.used_count >= row.max_uses) return { ok: false, reason: "exhausted" };
  if (subtotal < Number(row.min_subtotal ?? 0)) {
    return { ok: false, reason: "min_subtotal", minSubtotal: Number(row.min_subtotal) };
  }
  return {
    ok: true,
    id: row.id,
    rule: {
      code: row.code,
      type: row.type === "fixed" ? "fixed" : "percent",
      value: Number(row.value),
      minSubtotal: Number(row.min_subtotal ?? 0),
    },
  };
}

/** Atomically consumes one use; false when the limit was reached by a concurrent order. */
export async function claimDiscountUse(id: string): Promise<boolean> {
  const rows = await sql`
    UPDATE discount_codes
    SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND (max_uses IS NULL OR used_count < max_uses)
    RETURNING id
  `;
  return rows.length > 0;
}

export function discountErrorAr(reason: string, minSubtotal?: number) {
  switch (reason) {
    case "expired":
      return "انتهت صلاحية كود الخصم";
    case "exhausted":
      return "تم استخدام كود الخصم بالكامل";
    case "min_subtotal":
      return `الحد الأدنى للطلب لاستخدام هذا الكود ${minSubtotal ?? 0} ر.س`;
    default:
      return "كود الخصم غير صالح";
  }
}
