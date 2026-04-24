import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, sort_order, created_at, updated_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `;
    return NextResponse.json(
      rows.map((row) => ({
        _id: row.id,
        name: row.name,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
