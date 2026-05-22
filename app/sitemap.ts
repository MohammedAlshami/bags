import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { productUrl, blogUrl } from "@/lib/slugs";

const BASE_URL = "https://goldqueen.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/shop`, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/locations`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
  ];

  type Row = { id: string; date?: string | null };

  const [all, published, pkg] = await Promise.all([
    sql`SELECT id, COALESCE(updated_at, created_at) AS date FROM products ORDER BY date DESC`,
    sql`SELECT id, COALESCE(updated_at, created_at) AS date FROM blog_posts WHERE status = 'published' ORDER BY date DESC`,
    sql`SELECT id, COALESCE(updated_at, created_at) AS date FROM packages ORDER BY date DESC`,
  ]);

  const products = (all as Row[]).map((r) => ({
    url: `${BASE_URL}${productUrl(r.id)}`,
    changeFrequency: "weekly" as const,
    priority: 1,
    lastModified: r.date ? new Date(r.date) : now,
  }));

  const blogs = (published as Row[]).map((r) => ({
    url: `${BASE_URL}${blogUrl(r.id)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastModified: r.date ? new Date(r.date) : now,
  }));

  const packages = (pkg as Row[]).map((r) => ({
    url: `${BASE_URL}/package/${r.id}`,
    changeFrequency: "weekly" as const,
    priority: 1,
    lastModified: r.date ? new Date(r.date) : now,
  }));

  return [...staticPages, ...products, ...blogs, ...packages];
}
