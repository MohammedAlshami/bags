import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "customer"], default: "customer" },
    email: { type: String, default: "" },
    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
