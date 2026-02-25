import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    story: { type: String, default: "" },
    material: { type: String, default: "" },
    quality: { type: String, default: "" },
  },
  { timestamps: true, collection: "collections" }
);

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);
