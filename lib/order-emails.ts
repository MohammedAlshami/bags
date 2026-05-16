import { formatSar } from "@/lib/format-sar";

const AGENTMAIL_API = "https://api.agentmail.to/v0/inboxes";

function getEnv(key: string) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

async function sendAgentMail(to: string[], subject: string, text: string, html: string) {
  const apiKey = getEnv("AGENTMAIL_API_KEY");
  const inboxId = getEnv("AGENTMAIL_INBOX_ID");
  const encodedInboxId = encodeURIComponent(inboxId);

  const res = await fetch(`${AGENTMAIL_API}/${encodedInboxId}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AgentMail send failed: ${res.status} ${err}`);
  }
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "قيد الانتظار",
    paid: "مدفوع",
    shipped: "تم الشحن",
    cancelled: "ملغي",
  };
  return map[status] ?? status;
}

function formatDateAr(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function buildItemsHtml(items: Array<{ name: string; quantity: number; price: number }>): string {
  return items
    .map(
      (it) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${it.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${it.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${formatSar(it.price)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${formatSar(it.price * it.quantity)}</td>
    </tr>`
    )
    .join("");
}

function buildAddressHtml(shippingAddress: Record<string, string>): string {
  const parts = [
    shippingAddress.fullName,
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.state,
  ].filter(Boolean);
  return parts.join("، ") || "غير محدد";
}

// ─── Order Created (when customer confirms order) ───

export async function sendOrderCreatedEmail(params: {
  adminEmail: string;
  customerEmail: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: Record<string, string>;
  createdAt: string;
  paymentMethod: string;
}) {
  const { adminEmail, customerEmail, orderId, customerName, customerPhone, total, status, items, shippingAddress, createdAt, paymentMethod } = params;
  const shortId = orderId.slice(0, 8);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goldqueen.store";
  const paymentMethodLabel = paymentMethod === "cod" ? "الدفع عند الاستلام" : paymentMethod === "bank" ? "تحويل بنكي" : paymentMethod;

  // Admin email
  const adminItemsHtml = buildItemsHtml(items);
  const adminAddressHtml = buildAddressHtml(shippingAddress);

  const adminHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#B63A6B;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#fce4ec;color:#B63A6B;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:#fafafa;padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:2px solid #eee;}
  .total-row td{background:#fafafa;font-weight:700;padding:12px;text-align:center;border-top:2px solid #eee;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#B63A6B;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
  .btn{display:inline-block;background:#B63A6B;color:#fff;text-decoration:none;padding:10px 24px;border-radius:50px;font-size:14px;font-weight:600;margin:8px 0;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>طلب جديد — #${shortId}</h1></div>
  <div class="body">
    <p>تم إنشاء الطلب <strong>#${shortId}</strong> بنجاح <span class="badge">${statusLabel(status)}</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>
    <p><strong>طريقة الدفع:</strong> ${paymentMethodLabel}</p>
    <div class="info-grid">
      <div class="info-box">
        <h4>معلومات العميل</h4>
        <p><strong>الاسم:</strong> ${customerName}</p>
        <p><strong>البريد:</strong> ${customerEmail}</p>
        <p><strong>الهاتف:</strong> ${customerPhone}</p>
      </div>
      <div class="info-box">
        <h4>عنوان الشحن</h4>
        <p>${adminAddressHtml}</p>
      </div>
    </div>
    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">تفاصيل الطلب</h3>
    <table>
      <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
      <tbody>${adminItemsHtml}
        <tr class="total-row"><td colspan="3">المجموع الكلي</td><td>${formatSar(total)}</td></tr>
      </tbody>
    </table>
    <p style="text-align:center;margin-top:24px;">
      <a href="${siteUrl}/admin/orders" class="btn">عرض الطلب في لوحة الإدارة</a>
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

  const adminText = `طلب جديد\nالطلب: #${shortId}\nالحالة: ${statusLabel(status)}\nطريقة الدفع: ${paymentMethodLabel}\nالعميل: ${customerName}\nالبريد: ${customerEmail}\nالهاتف: ${customerPhone}\nالمجموع: ${formatSar(total)}\nالتاريخ: ${formatDateAr(createdAt)}\nعرض الطلب: ${siteUrl}/admin/orders`;

  await sendAgentMail([adminEmail], `طلب جديد #${shortId}`, adminText, adminHtml);

  // Customer email (only if valid email)
  if (isValidEmail(customerEmail)) {
    const custItemsHtml = buildItemsHtml(items);
    const custAddressHtml = buildAddressHtml(shippingAddress);

    const custHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#B63A6B;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#fce4ec;color:#B63A6B;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:#fafafa;padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:2px solid #eee;}
  .total-row td{background:#fafafa;font-weight:700;padding:12px;text-align:center;border-top:2px solid #eee;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#B63A6B;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>تم تأكيد طلبك بنجاح</h1></div>
  <div class="body">
    <p>أهلاً <strong>${customerName}</strong>،</p>
    <p>تم استلام طلبك <strong>#${shortId}</strong> بنجاح <span class="badge">${statusLabel(status)}</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>
    <p><strong>طريقة الدفع:</strong> ${paymentMethodLabel}</p>

    ${paymentMethod === "bank" ? `<p style="background:#fce4ec;padding:12px;border-radius:8px;font-size:13px;">يرجى إرسال إيصال التحويل البنكي لتأكيد طلبك.</p>` : ""}

    <div class="info-grid">
      <div class="info-box">
        <h4>عنوان الشحن</h4>
        <p>${custAddressHtml}</p>
      </div>
      <div class="info-box">
        <h4>رقم الهاتف</h4>
        <p>${customerPhone || "غير محدد"}</p>
      </div>
    </div>

    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">تفاصيل الطلب</h3>
    <table>
      <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
      <tbody>${custItemsHtml}
        <tr class="total-row"><td colspan="3">المجموع الكلي</td><td>${formatSar(total)}</td></tr>
      </tbody>
    </table>

    <p style="text-align:center;margin-top:16px;font-size:13px;color:#888;">شكراً لتسوقك معنا!</p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

    const custText = `أهلاً ${customerName}،\n\nتم استلام طلبك #${shortId} بنجاح.\nالحالة: ${statusLabel(status)}\nطريقة الدفع: ${paymentMethodLabel}\nالمجموع: ${formatSar(total)}\nالتاريخ: ${formatDateAr(createdAt)}\n\nشكراً لتسوقك معنا!`;

    await sendAgentMail([customerEmail.trim()], `تم تأكيد طلبك #${shortId}`, custText, custHtml);
  }
}

// ─── Order Complete (when admin marks as paid) ───

export async function sendOrderCompleteEmail(params: {
  adminEmail: string;
  customerEmail: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: Record<string, string>;
  createdAt: string;
}) {
  const { adminEmail, customerEmail, orderId, customerName, customerPhone, total, status, items, shippingAddress, createdAt } = params;
  const shortId = orderId.slice(0, 8);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goldqueen.store";

  // Admin email
  const adminItemsHtml = buildItemsHtml(items);
  const adminAddressHtml = buildAddressHtml(shippingAddress);

  const adminHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#B63A6B;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#e8f5e9;color:#2e7d32;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:#fafafa;padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:2px solid #eee;}
  .total-row td{background:#fafafa;font-weight:700;padding:12px;text-align:center;border-top:2px solid #eee;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#B63A6B;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
  .btn{display:inline-block;background:#B63A6B;color:#fff;text-decoration:none;padding:10px 24px;border-radius:50px;font-size:14px;font-weight:600;margin:8px 0;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>إشعار طلب — ${statusLabel(status)}</h1></div>
  <div class="body">
    <p>تم تحديث الطلب <strong>#${shortId}</strong> إلى حالة <span class="badge">${statusLabel(status)}</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>
    <div class="info-grid">
      <div class="info-box">
        <h4>معلومات العميل</h4>
        <p><strong>الاسم:</strong> ${customerName}</p>
        <p><strong>البريد:</strong> ${customerEmail}</p>
        <p><strong>الهاتف:</strong> ${customerPhone}</p>
      </div>
      <div class="info-box">
        <h4>عنوان الشحن</h4>
        <p>${adminAddressHtml}</p>
      </div>
    </div>
    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">تفاصيل الطلب</h3>
    <table>
      <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
      <tbody>${adminItemsHtml}
        <tr class="total-row"><td colspan="3">المجموع الكلي</td><td>${formatSar(total)}</td></tr>
      </tbody>
    </table>
    <p style="text-align:center;margin-top:24px;">
      <a href="${siteUrl}/admin/orders" class="btn">عرض الطلب في لوحة الإدارة</a>
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

  const adminText = `إشعار طلب جديد\nالطلب: #${shortId}\nالحالة: ${statusLabel(status)}\nالعميل: ${customerName}\nالبريد: ${customerEmail}\nالهاتف: ${customerPhone}\nالمجموع: ${formatSar(total)}\nالتاريخ: ${formatDateAr(createdAt)}\nعرض الطلب: ${siteUrl}/admin/orders`;

  await sendAgentMail([adminEmail], `طلب #${shortId} — ${statusLabel(status)}`, adminText, adminHtml);

  // Customer email
  if (isValidEmail(customerEmail)) {
    const custHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#B63A6B;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#e8f5e9;color:#2e7d32;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;margin:16px 0;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#B63A6B;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>تم تأكيد دفعة طلبك</h1></div>
  <div class="body">
    <p>أهلاً <strong>${customerName}</strong>،</p>
    <p>تم تأكيد دفعة الطلب <strong>#${shortId}</strong> <span class="badge">${statusLabel(status)}</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>
    <p><strong>المجموع:</strong> ${formatSar(total)}</p>
    <div class="info-box">
      <h4>سيتم التواصل معك قريباً لتفاصيل الشحن</h4>
    </div>
    <p style="text-align:center;margin-top:16px;font-size:13px;color:#888;">شكراً لتسوقك معنا!</p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

    const custText = `أهلاً ${customerName}،\n\nتم تأكيد دفعة طلبك #${shortId}.\nالحالة: ${statusLabel(status)}\nالمجموع: ${formatSar(total)}\n\nسيتم التواصل معك قريباً لتفاصيل الشحن.\n\nشكراً لتسوقك معنا!`;

    await sendAgentMail([customerEmail.trim()], `تم تأكيد دفعة طلبك #${shortId}`, custText, custHtml);
  }
}

// ─── Receipt Submitted (when customer uploads payment slip) ───

export async function sendReceiptSubmittedEmail(params: {
  adminEmail: string;
  customerEmail: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: Record<string, string>;
  receiptImageUrl: string;
  createdAt: string;
}) {
  const { adminEmail, customerEmail, orderId, customerName, customerPhone, total, items, shippingAddress, receiptImageUrl, createdAt } = params;
  const shortId = orderId.slice(0, 8);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goldqueen.store";

  // Admin email
  const adminItemsHtml = buildItemsHtml(items);
  const adminAddressHtml = buildAddressHtml(shippingAddress);

  const adminHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#2e7d32;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#e8f5e9;color:#2e7d32;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:#fafafa;padding:10px 12px;text-align:right;font-size:13px;color:#666;border-bottom:2px solid #eee;}
  .total-row td{background:#fafafa;font-weight:700;padding:12px;text-align:center;border-top:2px solid #eee;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#2e7d32;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .receipt-img{max-width:100%;border-radius:8px;margin:16px 0;border:1px solid #eee;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
  .btn{display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:10px 24px;border-radius:50px;font-size:14px;font-weight:600;margin:8px 0;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>إيصال دفع جديد — طلب #${shortId}</h1></div>
  <div class="body">
    <p>قام العميل <strong>${customerName}</strong> بإرسال إيصال الدفع للطلب <span class="badge">#${shortId}</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>
    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">صورة إيصال الدفع</h3>
    <img src="${receiptImageUrl}" alt="إيصال الدفع" class="receipt-img" />
    <div class="info-grid">
      <div class="info-box">
        <h4>معلومات العميل</h4>
        <p><strong>الاسم:</strong> ${customerName}</p>
        <p><strong>البريد:</strong> ${customerEmail}</p>
        <p><strong>الهاتف:</strong> ${customerPhone}</p>
      </div>
      <div class="info-box">
        <h4>عنوان الشحن</h4>
        <p>${adminAddressHtml}</p>
      </div>
    </div>
    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">تفاصيل الطلب</h3>
    <table>
      <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
      <tbody>${adminItemsHtml}
        <tr class="total-row"><td colspan="3">المجموع الكلي</td><td>${formatSar(total)}</td></tr>
      </tbody>
    </table>
    <p style="text-align:center;margin-top:24px;">
      <a href="${siteUrl}/admin/orders" class="btn">عرض الطلب في لوحة الإدارة</a>
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

  const adminText = `إيصال دفع جديد\nالطلب: #${shortId}\nالعميل: ${customerName}\nالبريد: ${customerEmail}\nالهاتف: ${customerPhone}\nالمجموع: ${formatSar(total)}\nصورة الإيصال: ${receiptImageUrl}\nالتاريخ: ${formatDateAr(createdAt)}\nعرض الطلب: ${siteUrl}/admin/orders`;

  await sendAgentMail([adminEmail], `إيصال دفع — طلب #${shortId}`, adminText, adminHtml);

  // Customer confirmation email
  if (isValidEmail(customerEmail)) {
    const custHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl;}
  .wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
  .header{background:#B63A6B;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:20px;font-weight:600;}
  .body{padding:32px;}
  .body p{color:#333;font-size:14px;line-height:1.7;margin:0 0 12px;}
  .badge{display:inline-block;background:#fce4ec;color:#B63A6B;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;}
  .receipt-img{max-width:100%;border-radius:8px;margin:16px 0;border:1px solid #eee;}
  .info-box{background:#fafafa;border-radius:8px;padding:16px;margin:16px 0;}
  .info-box h4{margin:0 0 8px;font-size:13px;color:#B63A6B;}
  .info-box p{margin:0;font-size:13px;color:#333;}
  .footer{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>تم استلام إيصال الدفع</h1></div>
  <div class="body">
    <p>أهلاً <strong>${customerName}</strong>،</p>
    <p>تم استلام إيصال الدفع للطلب <strong>#${shortId}</strong> بنجاح <span class="badge">قيد المراجعة</span></p>
    <p><strong>التاريخ:</strong> ${formatDateAr(createdAt)}</p>

    <h3 style="margin:24px 0 8px;font-size:16px;color:#333;">إيصال الدفع المرفوع</h3>
    <img src="${receiptImageUrl}" alt="إيصال الدفع" class="receipt-img" />

    <div class="info-box">
      <h4>المبلغ</h4>
      <p>${formatSar(total)}</p>
    </div>

    <p style="font-size:13px;color:#888;">سيتم مراجعة الإيصال وتأكيد الطلب قريباً. شكراً لك!</p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} الملكة جولد — جميع الحقوق محفوظة</div>
</div>
</body></html>`;

    const custText = `أهلاً ${customerName}،\n\nتم استلام إيصال الدفع للطلب #${shortId} بنجاح.\nالمبلغ: ${formatSar(total)}\nالتاريخ: ${formatDateAr(createdAt)}\n\nسيتم مراجعة الإيصال وتأكيد الطلب قريباً.\n\nشكراً لك!`;

    await sendAgentMail([customerEmail.trim()], `تم استلام إيصال الدفع — طلب #${shortId}`, custText, custHtml);
  }
}
