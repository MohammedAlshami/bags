import { sql } from "@/lib/db";
import { mapStoreLocation, type StoreLocationRow } from "@/lib/db-mappers";

export type StoreLocation = {
  _id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string | null;
  lat: number;
  lon: number;
  sortOrder: number;
};

export async function getAllStoreLocations(): Promise<StoreLocation[]> {
  const rows = await sql`
    SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
    FROM store_locations
    ORDER BY sort_order ASC, created_at ASC
  `;
  return rows.map((r) => mapStoreLocation(r as StoreLocationRow));
}

export async function getStoreLocationById(id: string): Promise<StoreLocation | undefined> {
  const rows = await sql`
    SELECT id, name, city, country, address, phone, lat, lon, sort_order, created_at, updated_at
    FROM store_locations
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as StoreLocationRow | undefined;
  return row ? mapStoreLocation(row) : undefined;
}

export async function isValidBranchKey(id: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM store_locations WHERE id = ${id} LIMIT 1
  `;
  return rows.length > 0;
}

export function buildMapEmbedUrl(lat: number, lon: number) {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=13&output=embed`;
}

export function buildGoogleMapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}
