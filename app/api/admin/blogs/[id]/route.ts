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

async function fetchBlog(id: string) {
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  return rows[0] as BlogPostRow | undefined;
}

async function slugConflict(slug: string, id: string) {
  const rows = await sql`
    SELECT id FROM blog_posts WHERE slug = ${slug} AND id <> ${id}::uuid LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const blog = await fetchBlog(id);
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapBlogPost(blog));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const current = await fetchBlog(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const title = normalizeString(body.title, current.title);
    const excerpt = normalizeString(body.excerpt, current.excerpt);
    const coverImage = normalizeString(body.coverImage, current.cover_image);
    const authorName = normalizeString(body.authorName, current.author_name);
    const status = normalizeBlogStatus(body.status, current.status === "published" ? "published" : "draft");
    const seoTitle = normalizeString(body.seoTitle, current.seo_title);
    const seoDescription = normalizeString(body.seoDescription, current.seo_description);
    const tags = body.tags !== undefined ? normalizeBlogTags(body.tags) : normalizeBlogTags(current.tags);
    const rawContent = body.content !== undefined ? body.content : current.content;
    const content = normalizeBlogBlocks(rawContent);
    const slug =
      body.slug !== undefined
        ? normalizeString(body.slug) || slugifyBlogTitle(title) || current.slug
        : current.slug;
    const publishedAt =
      status === "published"
        ? current.published_at ?? new Date().toISOString()
        : current.published_at;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!excerpt) return NextResponse.json({ error: "Excerpt required" }, { status: 400 });
    if (!authorName) return NextResponse.json({ error: "Author required" }, { status: 400 });
    if (!content.length && status === "published") {
      return NextResponse.json({ error: "Add at least one content block before publishing" }, { status: 400 });
    }
    if (slug !== current.slug && (await slugConflict(slug, id))) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    await sql`
      UPDATE blog_posts SET
        title = ${title},
        slug = ${slug},
        excerpt = ${excerpt},
        cover_image = ${coverImage},
        author_name = ${authorName},
        status = ${status},
        content = ${JSON.stringify(content)}::jsonb,
        seo_title = ${seoTitle},
        seo_description = ${seoDescription},
        tags = ${JSON.stringify(tags)}::jsonb,
        published_at = ${publishedAt},
        updated_at = now()
      WHERE id = ${id}::uuid
    `;

    const updated = await fetchBlog(id);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapBlogPost(updated));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const existing = await fetchBlog(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await sql`DELETE FROM blog_posts WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
