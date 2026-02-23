import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const match: Record<string, unknown> = { role: "customer" };
    if (search) {
      match.$or = [
        { username: new RegExp(escapeRegex(search), "i") },
        { email: new RegExp(escapeRegex(search), "i") },
        { fullName: new RegExp(escapeRegex(search), "i") },
      ];
    }
    const list = await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customer",
          as: "orders",
        },
      },
      { $addFields: { orderCount: { $size: "$orders" } } },
      { $project: { password: 0, orders: 0 } },
      { $sort: { createdAt: -1 } },
    ]);
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
