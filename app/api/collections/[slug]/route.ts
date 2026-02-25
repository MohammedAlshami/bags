import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

/** Public: get one collection by slug for the storefront. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: "Slug required" }, { status: 400 });
    await dbConnect();
    const doc = await Collection.findOne({ slug: slug.trim() }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}
