import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapFaqItem, type FaqItemRow } from "@/lib/faq-items";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM faq_items ORDER BY sort_order ASC`;
  return NextResponse.json((rows as FaqItemRow[]).map(mapFaqItem));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const question = String(body.question ?? "");
    const answer = String(body.answer ?? "");
    const sortOrder = Number(body.sortOrder ?? 0);
    const isActive = body.isActive ? 1 : 0;

    await sql`
      INSERT INTO faq_items (id, question, answer, sort_order, is_active)
      VALUES (${id}, ${question}, ${answer}, ${sortOrder}, ${isActive})
    `;
    const rows = await sql`SELECT * FROM faq_items WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapFaqItem(rows[0] as FaqItemRow), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create FAQ item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
