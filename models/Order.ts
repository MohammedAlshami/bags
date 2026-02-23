import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  slug: String,
  name: String,
  price: String,
  quantity: Number,
});

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postCode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "shipped", "cancelled"], default: "pending" },
    shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },
    trackingNumber: { type: String, default: "" },
    carrier: { type: String, default: "" },
    shippedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "orders" }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
