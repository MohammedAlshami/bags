import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const user = await User.findOne({ _id: id, role: "customer" })
      .select("-password")
      .lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const orders = await Order.find({ customer: id })
      .select("_id status total createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const orderCount = orders.length;
    return NextResponse.json({
      ...user,
      orderCount,
      orders: orders.map((o) => ({
        _id: String(o._id),
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.email === "string") updates.email = body.email.trim();
    if (typeof body.fullName === "string") updates.fullName = body.fullName.trim();
    if (typeof body.address === "string") updates.address = body.address.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim();
    if (typeof body.disabled === "boolean") updates.disabled = body.disabled;
    const user = await User.findOneAndUpdate(
      { _id: id, role: "customer" },
      { $set: updates },
      { new: true }
    )
      .select("-password")
      .lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
