import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapStoreLocation, type StoreLocationRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
      FROM store_locations
      ORDER BY sort_order ASC, created_at ASC
    `;
    return NextResponse.json(rows.map((r) => mapStoreLocation(r as StoreLocationRow)));
  } catch {
    return NextResponse.json({ error: "Failed to fetch store locations" }, { status: 500 });
  }
}
