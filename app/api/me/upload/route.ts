import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";
import { fileToImageDataUrl } from "@/lib/file-to-image-data-url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireCustomer();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await fileToImageDataUrl(file);
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
