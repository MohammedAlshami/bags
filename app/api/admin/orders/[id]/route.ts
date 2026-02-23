import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
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
    const order = await Order.findById(id)
      .populate("customer", "username email fullName address phone")
      .lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
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

    const status = body?.status;
    if (
      status === "pending" ||
      status === "paid" ||
      status === "shipped" ||
      status === "cancelled"
    ) {
      updates.status = status;
    }

    if (body?.shippingAddress && typeof body.shippingAddress === "object") {
      const sa = body.shippingAddress as Record<string, string>;
      updates.shippingAddress = {
        fullName: typeof sa.fullName === "string" ? sa.fullName : "",
        line1: typeof sa.line1 === "string" ? sa.line1 : "",
        line2: typeof sa.line2 === "string" ? sa.line2 : "",
        city: typeof sa.city === "string" ? sa.city : "",
        state: typeof sa.state === "string" ? sa.state : "",
        postCode: typeof sa.postCode === "string" ? sa.postCode : "",
        country: typeof sa.country === "string" ? sa.country : "",
      };
    }
    if (typeof body?.trackingNumber === "string") updates.trackingNumber = body.trackingNumber.trim();
    if (typeof body?.carrier === "string") updates.carrier = body.carrier.trim();
    if (body?.shippedAt !== undefined) {
      updates.shippedAt = body.shippedAt ? new Date(body.shippedAt) : null;
    }

    const orderBefore = await Order.findById(id).lean();
    if (!orderBefore) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (updates.status === "shipped" && !orderBefore.shippedAt) {
      updates.shippedAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("customer", "username email fullName address phone")
      .lean();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
