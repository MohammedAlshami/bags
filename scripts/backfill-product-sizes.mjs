import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(url);

const updates = [
  {
    slug: "product-015",
    sizes: [
      { label: "200ml", sarPrice: 15, oldRiyal: 2000 },
      { label: "500ml", sarPrice: 35, oldRiyal: 4500 },
    ],
  },
  {
    slug: "product-021",
    sizes: [
      { label: "100 جرام", sarPrice: 50, oldRiyal: 7000 },
      { label: "300 جرام", sarPrice: 150, oldRiyal: 21000 },
    ],
  },
  {
    slug: "product-024",
    sizes: [
      { label: "منطقة واحدة", sarPrice: 18, oldRiyal: 2500 },
      { label: "كامل الجسم", sarPrice: 100, oldRiyal: 14000 },
    ],
  },
];

for (const item of updates) {
  await sql`UPDATE products SET sizes = ${JSON.stringify(item.sizes)}::jsonb, updated_at = now() WHERE slug = ${item.slug}`;
}

await sql`UPDATE products SET sizes = NULL, updated_at = now() WHERE slug = ${"product-019"}`;

const rows = await sql`
  select slug, name, price, old_riyal, sizes
  from products
  where slug in ('product-015','product-019','product-021','product-024')
  order by slug
`;

console.log(JSON.stringify(rows, null, 2));
