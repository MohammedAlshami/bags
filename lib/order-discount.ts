/** Server + client: checkout voucher rules (keep in sync). */

export type CheckoutDiscountResult = {
  total: number;
  discountAmount: number;
  appliedCode: string | null;
};

export function applyCheckoutDiscount(subtotal: number, rawCode: string | undefined): CheckoutDiscountResult {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) {
    return { total: round2(subtotal), discountAmount: 0, appliedCode: null };
  }
  if (code === "QGB10") {
    const discountAmount = round2(subtotal * 0.1);
    const total = round2(subtotal - discountAmount);
    return { total, discountAmount, appliedCode: "QGB10" };
  }
  return { total: round2(subtotal), discountAmount: 0, appliedCode: null };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
