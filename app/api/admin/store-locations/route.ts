import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapStoreLocation, type StoreLocationRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
      FROM store_locations
      ORDER BY sort_order ASC, created_at ASC
    `;
    return NextResponse.json(rows.map((r) => mapStoreLocation(r as StoreLocationRow)));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch store locations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "اليمن";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const lat = typeof body.lat === "number" ? body.lat : NaN;
    const lon = typeof body.lon === "number" ? body.lon : NaN;
    const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name required" }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: "Valid lat/lon required" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM store_locations WHERE id = ${id} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "ID already exists" }, { status: 400 });
    }

    await sql`
      INSERT INTO store_locations (id, name, city, country, address, phone, lat, lon, sort_order)
      VALUES (${id}, ${name}, ${city}, ${country}, ${address}, ${phone}, ${lat}, ${lon}, ${sortOrder})
    `;

    const rows = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
      FROM store_locations WHERE id = ${id} LIMIT 1
    `;
    return NextResponse.json(mapStoreLocation(rows[0] as StoreLocationRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create store location" }, { status: 500 });
  }
}
