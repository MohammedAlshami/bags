import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
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
    const doc = await Product.findById(id).populate("collection", "name slug").lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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
    if (body.name != null) updates.name = String(body.name).trim();
    if (body.price != null) updates.price = String(body.price).trim();
    if (body.category != null) updates.category = String(body.category).trim();
    if (body.image != null) updates.image = String(body.image).trim();
    if (body.slug != null) updates.slug = String(body.slug).trim();
    if (body.collection != null) {
      if (body.collection && body.collection !== "general" && mongoose.Types.ObjectId.isValid(body.collection)) {
        const col = await Collection.findById(body.collection).lean();
        if (col) updates.collection = col._id;
        else {
          const defaultCol = await Collection.findOne({ slug: "essentials" }).lean();
          if (defaultCol) updates.collection = defaultCol._id;
        }
      } else {
        const defaultCol = await Collection.findOne({ slug: "essentials" }).lean();
        if (defaultCol) updates.collection = defaultCol._id;
      }
    }
    const doc = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true }).populate("collection", "name slug").lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
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
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
