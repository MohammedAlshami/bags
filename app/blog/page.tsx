import Link from "next/link";
import type { Metadata } from "next";

import { SafeImage } from "@/app/components/SafeImage";
import { sql } from "@/lib/db";
import { mapBlogPost, type BlogPostRow } from "@/lib/blog";
import { pagePaddingX, sans } from "@/lib/page-theme";
import { ArrowLeft, BookOpen, CalendarDays, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المدونة | الملكة جولد",
  description: "مقالات ونصائح عن العناية والجمال واستخدام المنتجات بطريقة أفضل.",
};

function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "long",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(date));
}

function PostCard({ post, featured = false }: { post: ReturnType<typeof mapBlogPost>; featured?: boolean }) {
  const cover = post.coverImage.trim();
  const tag = post.tags[0];

  return (
    <Link
      href={`/blog/${post._id}`}
      className={featured ? "group overflow-hidden rounded-[1.75rem] bg-transparent" : "group overflow-hidden rounded-[1.25rem] bg-transparent"}
      dir="rtl"
    >
      <article className={featured ? "grid h-full gap-8 lg:grid-cols-[1.05fr_0.95fr]" : "flex h-full flex-col gap-4"}>
        <div className={featured ? "order-2 lg:order-1" : ""}>
          <div className={featured ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
            {tag ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fdeaf0] px-3 py-1 text-[11px] font-medium text-[#a92f5f]">
                <Tag className="h-3 w-3" aria-hidden />
                {tag}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-[11px] text-neutral-600">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
          </div>

          <h2 className={featured ? "mt-4 text-3xl font-semibold leading-tight text-neutral-950 md:text-5xl" : "mt-4 text-xl font-semibold leading-tight text-neutral-950"}>
            {post.title}
          </h2>

          <p className={featured ? "mt-5 max-w-2xl text-base leading-8 text-neutral-700 md:text-lg" : "mt-3 text-sm leading-7 text-neutral-700"}>
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-[#b63a6b]" aria-hidden />
              {post.authorName}
            </span>
            <span>•</span>
            <span>اقرأ المقال</span>
            <ArrowLeft className="h-3.5 w-3.5 text-[#b63a6b] transition-transform group-hover:-translate-x-1" aria-hidden />
          </div>
        </div>

        <div className={featured ? "order-1 lg:order-2" : ""}>
          <div className={featured ? "relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#f7eef2] md:aspect-auto md:min-h-[24rem]" : "relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#f7eef2]"}>
            {cover ? (
              <SafeImage
                src={cover}
                alt={post.title}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                sizes={featured ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function BlogIndexPage() {
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC
  `;
  const posts = (rows as BlogPostRow[]).map(mapBlogPost);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div dir="rtl" style={sans} className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_right,_rgba(182,58,107,0.12),_transparent_34%),linear-gradient(180deg,#fff7fa_0%,#ffffff_80%)]" />
      <section className={`${pagePaddingX} mx-auto max-w-7xl pb-14 pt-10 md:pb-20 md:pt-14`}>
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-[#a92f5f]">
            <BookOpen className="h-4 w-4" aria-hidden />
            المدونة
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            نصائح، أخبار، ومقالات تساعدك على اختيار العناية المناسبة
          </h1>
          <div className="h-4 md:h-6" aria-hidden />
        </div>

        {featured ? (
          <div className="mt-10 mb-10">
            <PostCard post={featured} featured />
          </div>
        ) : (
          <div className="mt-10 mb-10 text-center text-neutral-500">لا توجد مقالات منشورة بعد.</div>
        )}

        {rest.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
