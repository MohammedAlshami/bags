import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadImageToR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

/** Returns `{ url }` as a data URL string saved in Neon on product/order rows. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await uploadImageToR2(file);
    return NextResponse.json({ url });
  } catch (err) {
    const e = err as { status?: number; message?: string };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = typeof e.message === "string" ? e.message : "";
    if (
      msg.includes("must be an image") ||
      msg.includes("Unsupported image") ||
      msg.includes("too large")
    ) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
