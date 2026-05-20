import { sql } from "@/lib/db";

export type FaqItemRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

export function mapFaqItem(row: FaqItemRow): FaqItem {
  return {
    _id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

export async function getActiveFaqItems(): Promise<FaqItem[]> {
  const rows = await sql`
    SELECT * FROM faq_items WHERE is_active = 1 ORDER BY sort_order ASC
  `;
  return (rows as FaqItemRow[]).map(mapFaqItem);
}
