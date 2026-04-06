/** ر.س — single locale (Arabic site). */
export function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " ر.س"
  );
}
