/** Pure checkout discount math — shared by the cart (client) and order creation (server). */

export type DiscountRule = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
};

export type CheckoutDiscountResult = {
  total: number;
  discountAmount: number;
  appliedCode: string | null;
};

export function applyDiscountRule(subtotal: number, rule: DiscountRule | null | undefined): CheckoutDiscountResult {
  if (!rule || subtotal < rule.minSubtotal) {
    return { total: round2(subtotal), discountAmount: 0, appliedCode: null };
  }
  const raw = rule.type === "percent" ? subtotal * (rule.value / 100) : rule.value;
  const discountAmount = round2(Math.min(Math.max(raw, 0), subtotal));
  return { total: round2(subtotal - discountAmount), discountAmount, appliedCode: rule.code };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
