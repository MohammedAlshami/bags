import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

async function sendResetEmail(to: string, displayName: string, resetUrl: string) {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  const inboxId = process.env.AGENTMAIL_INBOX_ID;

  if (!apiKey || !inboxId) {
    throw new Error("AgentMail env vars missing");
  }

  const textBody = `${displayName}،

لقد طلبت إعادة تعيين كلمة المرور لحسابك.

انقر على الرابط التالي لإعادة تعيين كلمة المرور:
${resetUrl}

هذا الرابط صالح لمدة ساعة واحدة فقط.

إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد بأمان.

مع تحيات،
فريق المتجر`;

  const htmlBody = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
    .wrapper { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #B63A6B; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
    .body { padding: 40px; }
    .body p { color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: #B63A6B; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
    .note { font-size: 13px; color: #888888; }
    .footer { background: #f9f9f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaaaaa; border-top: 1px solid #eeeeee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>إعادة تعيين كلمة المرور</h1></div>
    <div class="body">
      <p>${displayName}،</p>
      <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
      <p style="text-align:center;">
        <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a>
      </p>
      <p class="note">هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد بأمان.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} المتجر. جميع الحقوق محفوظة.</div>
  </div>
</body>
</html>`;

  const encodedInboxId = encodeURIComponent(inboxId);
  const res = await fetch(
    `https://api.agentmail.to/v0/inboxes/${encodedInboxId}/messages/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [to],
        subject: "إعادة تعيين كلمة المرور",
        text: textBody,
        html: htmlBody,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AgentMail send failed: ${res.status} ${err}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

    if (!emailRaw || !emailRaw.includes("@")) {
      return NextResponse.json({ message: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }

    const emailNorm = emailRaw.toLowerCase();

    const rows = await sql`
      SELECT id, email, full_name FROM users
      WHERE LOWER(TRIM(COALESCE(email, ''))) = ${emailNorm}
         OR LOWER(TRIM(username)) = ${emailNorm}
      LIMIT 1
    `;

    // Always return success to avoid email enumeration
    if (rows.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await sql`
      UPDATE users
      SET password_reset_token = ${token},
          password_reset_expires = ${expires}
      WHERE id = ${user.id as string}
    `;

    const resetUrl = `${getSiteUrl()}/login/reset-password?token=${token}`;
    const displayName = (user.full_name as string) || "عزيزي العميل";
    const toEmail = (user.email as string) || emailRaw;

    await sendResetEmail(toEmail, displayName, resetUrl);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return ok to avoid leaking info
    return NextResponse.json({ ok: true });
  }
}
