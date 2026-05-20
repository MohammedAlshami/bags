import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapStoreLocation, type StoreLocationRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const rows = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
      FROM store_locations WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0] as StoreLocationRow | undefined;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapStoreLocation(row));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch store location" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;

    const existing = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order
      FROM store_locations WHERE id = ${id} LIMIT 1
    `;
    const cur = existing[0] as StoreLocationRow | undefined;
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = typeof body.name === "string" ? body.name.trim() : cur.name;
    const city = typeof body.city === "string" ? body.city.trim() : cur.city;
    const country = typeof body.country === "string" ? body.country.trim() : cur.country;
    const address = typeof body.address === "string" ? body.address.trim() : cur.address;
    const phone = body.phone === null ? null : typeof body.phone === "string" ? body.phone.trim() || null : cur.phone;
    const lat = typeof body.lat === "number" ? body.lat : cur.lat;
    const lon = typeof body.lon === "number" ? body.lon : cur.lon;
    const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : cur.sort_order;

    await sql`
      UPDATE store_locations SET
        name = ${name},
        city = ${city},
        country = ${country},
        address = ${address},
        phone = ${phone},
        lat = ${lat},
        lon = ${lon},
        sort_order = ${sortOrder},
        updated_at = datetime('now')
      WHERE id = ${id}
    `;

    const rows = await sql`
      SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
      FROM store_locations WHERE id = ${id} LIMIT 1
    `;
    return NextResponse.json(mapStoreLocation(rows[0] as StoreLocationRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update store location" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await sql`SELECT id FROM store_locations WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await sql`DELETE FROM store_locations WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete store location" }, { status: 500 });
  }
}
