import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { productUrl, blogUrl } from "@/lib/slugs";

const BASE_URL = "https://goldqueen.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/locations`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/cart`, changeFrequency: "never", priority: 0.2 },
    { url: `${BASE_URL}/track`, changeFrequency: "never", priority: 0.2 },
  ];

  type PRow = { id: string; name: string; updated_at?: string | null };
  type BRow = { id: string; title: string; updated_at?: string | null };
  type PkgRow = { id: string; updated_at?: string | null };

  const [all, published, pkg] = await Promise.all([
    sql`SELECT id, name, updated_at FROM products ORDER BY updated_at DESC`,
    sql`SELECT id, title, updated_at FROM blog_posts WHERE status = 'published' ORDER BY updated_at DESC`,
    sql`SELECT id, updated_at FROM packages ORDER BY updated_at DESC`,
  ]);

  const products = (all as PRow[]).map((r) => ({
    url: `${BASE_URL}${productUrl(r.id, r.name)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
  }));

  const blogs = (published as BRow[]).map((r) => ({
    url: `${BASE_URL}${blogUrl(r.id, r.title)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
  }));

  const packages = (pkg as PkgRow[]).map((r) => ({
    url: `${BASE_URL}/package/${r.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
  }));

  return [...staticPages, ...products, ...blogs, ...packages];
}
