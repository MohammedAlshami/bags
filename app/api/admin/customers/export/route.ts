import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const users = await User.find({ role: "customer" })
      .select("username email fullName address createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const header = "username,email,fullName,address,createdAt\n";
    const rows = users.map(
      (u) =>
        [csvEsc(u.username), csvEsc(u.email ?? ""), csvEsc(u.fullName ?? ""), csvEsc(u.address ?? ""), (u as { createdAt?: Date }).createdAt?.toISOString() ?? ""].join(
          ","
        )
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
