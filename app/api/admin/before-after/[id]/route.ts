import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapBeforeAfter, type BeforeAfterRow } from "@/lib/before-after";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const imageUrl = String(body.imageUrl ?? "");

    await sql`
      UPDATE before_after_images SET image_url = ${imageUrl}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM before_after_images WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapBeforeAfter(rows[0] as BeforeAfterRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update before/after image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM before_after_images WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete before/after image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
