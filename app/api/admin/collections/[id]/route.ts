import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/models/Collection";
import Product from "@/models/Product";
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
    const doc = await Collection.findById(id).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
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
    const updates: Record<string, string> = {};
    if (body.name != null) updates.name = String(body.name).trim();
    if (body.slug != null) updates.slug = String(body.slug).trim();
    if (body.image != null) updates.image = String(body.image).trim();
    if (body.description != null) updates.description = String(body.description).trim();
    if (body.story != null) updates.story = String(body.story).trim();
    if (body.material != null) updates.material = String(body.material).trim();
    if (body.quality != null) updates.quality = String(body.quality).trim();
    const doc = await Collection.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
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
    await Product.updateMany({ collection: id }, { $set: { collection: null } });
    await Collection.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
