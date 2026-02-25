import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

/** Public: list all collections for the storefront. */
export async function GET() {
  try {
    await dbConnect();
    const list = await Collection.find({}).sort({ name: 1 }).select("name slug image description").lean();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
