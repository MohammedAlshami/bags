import { sql } from "@/lib/db";

export type BeforeAfterRow = {
  id: string;
  image_url: string;
  created_at: string;
};

export type BeforeAfterImage = {
  _id: string;
  imageUrl: string;
};

export function mapBeforeAfter(row: BeforeAfterRow): BeforeAfterImage {
  return {
    _id: row.id,
    imageUrl: row.image_url,
  };
}

export async function getBeforeAfterImages(): Promise<BeforeAfterImage[]> {
  const rows = await sql`
    SELECT * FROM before_after_images ORDER BY sort_order ASC
  `;
  return (rows as BeforeAfterRow[]).map(mapBeforeAfter);
}
