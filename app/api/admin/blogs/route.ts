import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  mapBlogPost,
  normalizeBlogBlocks,
  normalizeBlogStatus,
  normalizeBlogTags,
  slugifyBlogTitle,
  type BlogPostRow,
} from "@/lib/blog";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function buildSlug(title: string, slugValue: unknown) {
  const explicit = normalizeString(slugValue);
  if (explicit) return explicit;
  const slug = slugifyBlogTitle(title);
  return slug || `blog-${randomUUID().replace(/-/g, "")}`;
}

async function fetchSlugConflict(slug: string, id?: string) {
  if (id && isUuid(id)) {
    const rows = await sql`
      SELECT id FROM blog_posts WHERE slug = ${slug} AND id <> ${id}::uuid LIMIT 1
    `;
    return rows.length > 0;
  }
  const rows = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
  return rows.length > 0;
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`
      SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
             seo_description, tags, published_at, created_at, updated_at
      FROM blog_posts
      ORDER BY created_at DESC
    `;
    return NextResponse.json((rows as BlogPostRow[]).map(mapBlogPost));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;
    const title = normalizeString(body.title);
    const excerpt = normalizeString(body.excerpt);
    const coverImage = normalizeString(body.coverImage);
    const authorName = normalizeString(body.authorName);
    const status = normalizeBlogStatus(body.status);
    const seoTitle = normalizeString(body.seoTitle);
    const seoDescription = normalizeString(body.seoDescription);
    const tags = normalizeBlogTags(body.tags);
    const content = normalizeBlogBlocks(body.content);
    const slug = buildSlug(title, body.slug);
    const publishedAt =
      status === "published" ? new Date().toISOString() : null;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!excerpt) return NextResponse.json({ error: "Excerpt required" }, { status: 400 });
    if (!authorName) return NextResponse.json({ error: "Author required" }, { status: 400 });
    if (!content.length && status === "published") {
      return NextResponse.json({ error: "Add at least one content block before publishing" }, { status: 400 });
    }
    if (await fetchSlugConflict(slug)) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, cover_image, author_name, status, content,
        seo_title, seo_description, tags, published_at
      )
      VALUES (
        ${randomUUID()}::uuid,
        ${title},
        ${slug},
        ${excerpt},
        ${coverImage},
        ${authorName},
        ${status},
        ${JSON.stringify(content)}::jsonb,
        ${seoTitle},
        ${seoDescription},
        ${JSON.stringify(tags)}::jsonb,
        ${publishedAt}
      )
      RETURNING id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
                seo_description, tags, published_at, created_at, updated_at
    `;

    return NextResponse.json(mapBlogPost(inserted[0] as BlogPostRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
