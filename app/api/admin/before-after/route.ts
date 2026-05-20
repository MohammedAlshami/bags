import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapBeforeAfter, type BeforeAfterRow } from "@/lib/before-after";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM before_after_images ORDER BY created_at DESC`;
  return NextResponse.json((rows as BeforeAfterRow[]).map(mapBeforeAfter));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const imageUrl = String(body.imageUrl ?? "");

    await sql`
      INSERT INTO before_after_images (id, image_url)
      VALUES (${id}, ${imageUrl})
    `;
    const rows = await sql`SELECT * FROM before_after_images WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapBeforeAfter(rows[0] as BeforeAfterRow), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create before/after image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
