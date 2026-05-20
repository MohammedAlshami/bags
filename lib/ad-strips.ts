import { sql } from "@/lib/db";

export type AdStripRow = {
  id: string;
  text: string;
  is_active: number;
  bg_color: string | null;
  text_color: string | null;
  link_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AdStrip = {
  _id: string;
  text: string;
  isActive: boolean;
  bgColor: string | null;
  textColor: string | null;
  linkUrl: string | null;
};

export function mapAdStrip(row: AdStripRow): AdStrip {
  return {
    _id: row.id,
    text: row.text,
    isActive: row.is_active === 1,
    bgColor: row.bg_color ?? null,
    textColor: row.text_color ?? null,
    linkUrl: row.link_url ?? null,
  };
}

export async function getActiveStrip(): Promise<AdStrip | undefined> {
  const rows = await sql`
    SELECT * FROM ad_strips WHERE is_active = 1 LIMIT 1
  `;
  const row = rows[0] as AdStripRow | undefined;
  return row ? mapAdStrip(row) : undefined;
}
