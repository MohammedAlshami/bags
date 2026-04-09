import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLOAD_SUBDIR = "uploads";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  try {
    await requireCustomer();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported image type (use JPEG, PNG, WebP, or GIF)" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", UPLOAD_SUBDIR);
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(dir, filename);
    await writeFile(filepath, buf);

    const url = `/${UPLOAD_SUBDIR}/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
