/**
 * Bank transfer details shown to customers at checkout.
 * Replace with your real account details before production.
 */
export const BANK_TRANSFER_INFO = {
  bankName: "مصرف الراجحي",
  accountName: "متجر المكياج — اسم التجاري",
  iban: "SA0380000000608010167519",
  accountNumber: "608010167519",
  /** Short note for the transfer reference field */
  referenceHint: "اكتب رقم الطلب في ملاحظات التحويل أو الوصف",
} as const;
