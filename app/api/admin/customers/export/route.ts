import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const users = await sql`
      SELECT username, email, full_name, address, created_at
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `;
    const header = "username,email,fullName,address,createdAt\n";
    const rows = users.map(
      (u) =>
        [
          csvEsc(u.username as string),
          csvEsc((u.email as string) ?? ""),
          csvEsc((u.full_name as string) ?? ""),
          csvEsc((u.address as string) ?? ""),
          u.created_at ? new Date(u.created_at as string).toISOString() : "",
        ].join(",")
    );
    const csv = header + rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=customers.csv",
      },
    });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function csvEsc(val: string): string {
  if (/[,"\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}
