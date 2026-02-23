import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId")?.trim();
    const query = collectionId && mongoose.Types.ObjectId.isValid(collectionId)
      ? { collection: collectionId }
      : {};
    const list = await Product.find(query).populate("collection", "name slug").sort({ name: 1 }).lean();
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const price = String(body.price ?? "").trim();
    const category = String(body.category ?? "").trim();
    const image = String(body.image ?? "").trim();
    let slug = String(body.slug ?? "").trim();
    if (!slug) slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let collectionId: mongoose.Types.ObjectId | null = null;
    if (body.collection && body.collection !== "general" && mongoose.Types.ObjectId.isValid(body.collection)) {
      const col = await Collection.findById(body.collection).lean();
      if (col) collectionId = col._id as mongoose.Types.ObjectId;
    }
    if (!collectionId) {
      const defaultCol = await Collection.findOne({ slug: "essentials" }).lean();
      if (defaultCol) collectionId = defaultCol._id as mongoose.Types.ObjectId;
    }
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection is required. Create a collection first (e.g. slug: essentials)." },
        { status: 400 }
      );
    }
    if (!name || !price || !category || !image) {
      return NextResponse.json({ error: "Name, price, category, and image required" }, { status: 400 });
    }
    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    const doc = await Product.create({ name, price, category, image, slug, collection: collectionId });
    const populated = await Product.findById(doc._id).populate("collection", "name slug").lean();
    return NextResponse.json(populated);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
