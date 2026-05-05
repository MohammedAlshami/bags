/**
 * Yemen branch — transfer & checkout copy (cart payment step + pre-checkout guide).
 */

export const YEMEN_TRANSFER_ACCOUNT_HOLDER = "ريهام منصور حسين ناصر" as const;

export const YEMEN_TRANSFER_MAIN_PHONE = "782731816" as const;

export const yemenTransferPaymentBlocks = [
  {
    title: "إيداع عبر محفظة جيب أو ون كاش",
    lines: [`رقم المحفظة: ${YEMEN_TRANSFER_MAIN_PHONE}`],
  },
  {
    title: "حوالة نجم أو امتياز أو أي وكيل صرافة",
    lines: [`اسم المستلم: ${YEMEN_TRANSFER_ACCOUNT_HOLDER}`, `رقم المستلم: ${YEMEN_TRANSFER_MAIN_PHONE}`],
  },
  {
    title: "أو عبر أحد حسابات بنك الكريمي",
    lines: ["حساب الكريمي (ريال يمني): 3096848233", "حساب الكريمي (ريال سعودي): 3096823095"],
  },
] as const;

export const yemenTransferFootnotes = [
  `ملاحظة: الحسابات باسم ${YEMEN_TRANSFER_ACCOUNT_HOLDER}.`,
  "ملاحظة هامة: يرجى إرسال سند التحويل أو لقطة شاشة لعملية الدفع لكي يتم اعتماد طلبكم.",
  "اكتبوا رقم الطلب في ملاحظات التحويل أو الوصف إن أمكن.",
] as const;
