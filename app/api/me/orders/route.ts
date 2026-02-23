import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const orders = await Order.find({ customer: session.sub })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      orders.map((o) => ({
        _id: o._id,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        shippedAt: o.shippedAt,
        items: o.items,
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
