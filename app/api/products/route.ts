import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoriesParam = searchParams.getAll("category").filter(Boolean);
    const collectionSlug = searchParams.get("collection")?.trim() || "";

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (categoriesParam.length > 0) {
      filter.category = categoriesParam.length === 1 ? categoriesParam[0] : { $in: categoriesParam };
    }
    if (collectionSlug) {
      if (collectionSlug.toLowerCase() === "general") {
        filter.$and = [{ $or: [{ collection: null }, { collection: { $exists: false } }] }];
      } else {
        const col = await Collection.findOne({ slug: collectionSlug }).select("_id").lean();
        if (col) filter.collection = col._id;
      }
    }

    const products = await Product.find(filter).lean();
    return NextResponse.json(products);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
