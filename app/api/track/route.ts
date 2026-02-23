import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId")?.trim();
    const email = searchParams.get("email")?.trim();

    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Order ID and email are required" },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await dbConnect();
    const order = await Order.findById(orderId)
      .populate("customer", "email")
      .lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const customerEmail = (order.customer as { email?: string })?.email ?? "";
    if (customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order._id,
      status: order.status,
      trackingNumber: order.trackingNumber || null,
      carrier: order.carrier || null,
      shippedAt: order.shippedAt || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
