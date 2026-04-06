/** Admin UI: Arabic labels for DB/API English values (single-locale site). */

export const ORDER_STATUS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغاة",
};

export function orderStatusAr(status: string) {
  return ORDER_STATUS_AR[status] ?? "غير معروف";
}

const API_ERR: Record<string, string> = {
  Error: "خطأ",
  Forbidden: "غير مسموح",
  "Failed to load": "تعذر التحميل",
  "Failed to load customers": "تعذر تحميل العملاء",
  "Failed to load orders": "تعذر تحميل الطلبات",
  "Failed to save": "تعذر الحفظ",
  "Failed to delete": "تعذر الحذف",
  "Failed to update": "تعذر التحديث",
  "Failed to fetch collections": "تعذر تحميل المجموعات",
  "Failed to fetch collection": "تعذر تحميل المجموعة",
  "Failed to create collection": "تعذر إنشاء المجموعة",
  "Failed to update collection": "تعذر تحديث المجموعة",
  "Failed to delete collection": "تعذر حذف المجموعة",
  "Failed to fetch customers": "تعذر تحميل العملاء",
  "Failed to fetch customer": "تعذر تحميل العميل",
  "Failed to update customer": "تعذر تحديث العميل",
  "Failed to fetch orders": "تعذر تحميل الطلبات",
  "Failed to fetch order": "تعذر تحميل الطلب",
  "Failed to update order": "تعذر تحديث الطلب",
  "Upload failed": "فشل الرفع",
  "Invalid id": "معرّف غير صالح",
  "Not found": "غير موجود",
  "Slug already taken": "المسار (slug) مستخدم مسبقاً",
  "Name required": "الاسم مطلوب",
  "Export failed": "فشل التصدير",
  "Cloudinary not configured": "خدمة الصور غير مهيأة",
  "No file provided": "لم يُرفع ملف",
};

export function adminApiErrorAr(msg: string) {
  return API_ERR[msg] ?? msg;
}
