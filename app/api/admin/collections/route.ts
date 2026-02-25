import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/models/Collection";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const list = await Collection.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const slug = String(body.slug ?? "").trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const image = String(body.image ?? "").trim();
    const description = String(body.description ?? "").trim();
    const story = String(body.story ?? "").trim();
    const material = String(body.material ?? "").trim();
    const quality = String(body.quality ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const existing = await Collection.findOne({ slug });
    if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    const doc = await Collection.create({ name, slug, image, description, story, material, quality });
    return NextResponse.json(doc.toObject());
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
