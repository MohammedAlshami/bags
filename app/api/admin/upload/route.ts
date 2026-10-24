import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleImageUpload } from "@/lib/upload-handler";

export const dynamic = "force-dynamic";

/** Accepts the optimized image set built by `postOptimizedImage` and returns `{ url }`. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return handleImageUpload(request);
}
