import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SafeImage } from "@/app/components/SafeImage";
import { sql } from "@/lib/db";
import { mapBlogPost, type BlogBlock, type BlogPostRow } from "@/lib/blog";
import { pagePaddingX, sans } from "@/lib/page-theme";
import { CalendarDays, BookOpen, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "long",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(date));
}

function renderBlock(block: BlogBlock) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? <h2 key={block.id} className="mt-12 text-2xl font-semibold tracking-tight text-neutral-950 md:text-3xl">{block.text}</h2>
        : block.level === 3 ? <h3 key={block.id} className="mt-10 text-xl font-semibold tracking-tight text-neutral-950 md:text-2xl">{block.text}</h3>
        : <h4 key={block.id} className="mt-8 text-lg font-semibold tracking-tight text-neutral-950 md:text-xl">{block.text}</h4>;
    case "paragraph":
      return <p key={block.id} className="mt-6 text-[1.04rem] leading-[2.05] text-neutral-800 md:text-[1.08rem]">{block.text}</p>;
    case "image":
      return (
        <figure key={block.id} className="mt-10 overflow-hidden rounded-[1.5rem] bg-transparent">
          <div className="relative aspect-[16/10] bg-[#f7eef2] md:aspect-[16/9]">
            {block.src ? <SafeImage src={block.src} alt={block.alt} fill className="rounded-[1.5rem] object-cover object-center" sizes="(max-width: 768px) 100vw, 720px" /> : null}
          </div>
          {block.caption ? <figcaption className="px-1 pt-3 text-sm text-neutral-500">{block.caption}</figcaption> : null}
        </figure>
      );
    case "quote":
      return <blockquote key={block.id} className="mt-10 pr-5 text-lg leading-8 text-neutral-800 md:text-xl md:leading-9"><p>{block.text}</p>{block.citation ? <footer className="mt-3 text-sm text-neutral-500">{block.citation}</footer> : null}</blockquote>;
    case "list":
      return block.ordered ? (
        <ol key={block.id} className="mt-6 list-decimal space-y-3 pr-6 text-[1.02rem] leading-[2] text-neutral-800 md:text-[1.05rem]">
          {block.items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}
        </ol>
      ) : (
        <ul key={block.id} className="mt-6 list-disc space-y-3 pr-6 text-[1.02rem] leading-[2] text-neutral-800 md:text-[1.05rem]">
          {block.items.map((item, index) => <li key={`${block.id}-${index}`}>{item}</li>)}
        </ul>
      );
    case "callout":
      return <aside key={block.id} className="mt-10 rounded-[1.5rem] bg-[#fff7fb] px-6 py-6 text-[1rem] leading-8 text-neutral-800 md:px-8 md:py-7">{block.text}</aside>;
    case "divider":
      return <div key={block.id} className="mt-10 h-px bg-neutral-100" />;
    default:
      return null;
  }
}

async function getBlogById(id: string) {
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
    WHERE id = ${id}::uuid AND status = 'published'
    LIMIT 1
  `;
  return rows[0] ? mapBlogPost(rows[0] as BlogPostRow) : null;
}

async function getRelatedPosts(id: string) {
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
    WHERE status = 'published' AND id <> ${id}::uuid
    ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC
    LIMIT 3
  `;
  return (rows as BlogPostRow[]).map(mapBlogPost);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) {
    return { title: "المدونة | الملكة جولد", description: "مقالات ونصائح عن العناية والجمال." };
  }
  return {
    title: `${post.seoTitle || post.title} | الملكة جولد`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogById(id);
  if (!post) notFound();
  const related = await getRelatedPosts(id);
  const cover = post.coverImage.trim();
  const blocks = post.content.length > 0 ? post.content : [];

  return (
    <div dir="rtl" style={sans} className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[18rem] bg-[radial-gradient(circle_at_top_right,_rgba(182,58,107,0.08),_transparent_34%),linear-gradient(180deg,#fff7fa_0%,#ffffff_84%)]" />
      <article className={`${pagePaddingX} mx-auto max-w-5xl pb-20 pt-10 md:pt-14`}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#fdeaf0] px-3 py-1 text-[11px] font-medium text-[#a92f5f]"><Tag className="h-3 w-3" aria-hidden />{tag}</span>)}
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-[11px] text-neutral-600"><CalendarDays className="h-3 w-3" aria-hidden />{formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-[11px] text-neutral-600"><BookOpen className="h-3 w-3" aria-hidden />{post.authorName}</span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-[1.05rem] leading-[2.05] text-neutral-700 md:text-[1.1rem]">{post.excerpt}</p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#f7eef2]">
            <div className="relative aspect-[16/9] md:aspect-[16/8]">
              {cover ? <SafeImage src={cover} alt={post.title} fill className="rounded-[1.75rem] object-cover object-center" sizes="(max-width: 1024px) 100vw, 1100px" /> : null}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-3xl space-y-1">{blocks.length > 0 ? blocks.map((block) => renderBlock(block)) : <p className="text-[1.05rem] leading-[2.05] text-neutral-800">{post.excerpt}</p>}</div>
        {related.length > 0 ? (
          <section className="mx-auto mt-16 max-w-5xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-neutral-950">مقالات أخرى</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item._id} href={`/blog/${item._id}`} className="group overflow-hidden rounded-[1.5rem] bg-transparent">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#f7eef2]">
                    {item.coverImage ? <SafeImage src={item.coverImage} alt={item.title} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" /> : null}
                  </div>
                  <div className="px-1 pt-4">
                    <h3 className="text-lg font-semibold leading-snug text-neutral-950">{item.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-700">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}
