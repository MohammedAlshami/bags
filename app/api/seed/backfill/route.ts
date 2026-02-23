import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SEED_CUSTOMER_USERNAME = "customer";

const SEED_ADDRESS = "123 Main Street\nCape Town 8001\nSouth Africa";
const SEED_PHONE = "+27 21 123 4567";
const SEED_SHIPPING_ADDRESS = {
  fullName: "Seed Customer",
  line1: "123 Main Street",
  line2: "",
  city: "Cape Town",
  state: "Western Cape",
  postCode: "8001",
  country: "South Africa",
};

/** Backfill shipping/address on existing seed customer and their orders. Does not delete or change products/landing. */
export async function POST() {
  try {
    await dbConnect();

    const seedCustomer = await User.findOne({
      username: SEED_CUSTOMER_USERNAME,
      role: "customer",
    });
    if (!seedCustomer) {
      return NextResponse.json(
        { ok: false, error: "Seed customer not found. Run full seed first." },
        { status: 400 }
      );
    }

    const customerId = seedCustomer._id;

    await User.updateOne(
      { _id: customerId },
      { $set: { address: SEED_ADDRESS, phone: SEED_PHONE } }
    );

    const orders = await Order.find({ customer: customerId }).lean();
    let ordersUpdated = 0;
    for (const order of orders) {
      const needsShipping =
        !order.shippingAddress?.line1 &&
        !order.shippingAddress?.city &&
        !order.shippingAddress?.country;
      const needsTracking =
        order.status === "shipped" && !order.trackingNumber?.trim();

      const updates: Record<string, unknown> = {};
      if (needsShipping) updates.shippingAddress = SEED_SHIPPING_ADDRESS;
      if (needsTracking) {
        updates.trackingNumber = "CBW123456789ZA";
        updates.carrier = "DHL";
        if (!order.shippedAt) updates.shippedAt = new Date();
      }
      if (Object.keys(updates).length > 0) {
        await Order.updateOne({ _id: order._id }, { $set: updates });
        ordersUpdated += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Backfill complete",
      customerUpdated: true,
      ordersUpdated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backfill failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
