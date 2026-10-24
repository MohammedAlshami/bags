import { NextResponse } from "next/server";
import { uploadOptimizedImageToR2 } from "@/lib/r2";

/** Shared body of the admin and customer upload routes. Auth is checked by the caller. */
export async function handleImageUpload(request: Request) {
  try {
    const formData = await request.formData();
    const url = await uploadOptimizedImageToR2(formData);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("No file") || msg.includes("Unsupported image") || msg.includes("too large")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
