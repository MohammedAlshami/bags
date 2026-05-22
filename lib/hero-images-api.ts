export type HeroImageRow = {
  id: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  created_at: string;
};

export type HeroImage = {
  _id: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export function mapHeroImage(row: HeroImageRow): HeroImage {
  return {
    _id: row.id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

import { sql } from "@/lib/db";

export async function getActiveHeroImages(): Promise<HeroImage[]> {
  const rows = await sql`
    SELECT * FROM hero_images WHERE is_active = 1 ORDER BY sort_order ASC
  `;
  return (rows as HeroImageRow[]).map(mapHeroImage);
}
