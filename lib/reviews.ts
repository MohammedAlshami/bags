import { sql } from "@/lib/db";

export type ReviewRow = {
  id: string;
  author: string;
  body: string;
  product_id: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  _id: string;
  author: string;
  body: string;
  productId: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function mapReview(row: ReviewRow): Review {
  return {
    _id: row.id,
    author: row.author,
    body: row.body,
    productId: row.product_id ?? null,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

export async function getActiveReviews(): Promise<Review[]> {
  const rows = await sql`
    SELECT * FROM reviews WHERE is_active = 1 ORDER BY sort_order ASC
  `;
  return (rows as ReviewRow[]).map(mapReview);
}
