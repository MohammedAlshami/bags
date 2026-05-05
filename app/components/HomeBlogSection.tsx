"use client";

import Link from "next/link";
import { CalendarDays, BookOpen, ArrowLeft } from "lucide-react";
import { SafeImage } from "@/app/components/SafeImage";
import { sans } from "@/lib/page-theme";

/** Matches HomeFaqSection */
const SECTION_BG = "#FAF8F5";

export type HomeBlogPostItem = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
};

function formatDate(date: string | null, fallback: string) {
  const raw = date ?? fallback;
  if (!raw) return "";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(raw));
}

function BlogCard({ post }: { post: HomeBlogPostItem }) {
  const cover = post.coverImage.trim();
  const tag = post.tags[0];
  const dateLabel = formatDate(post.publishedAt, post.createdAt);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-colors hover:border-neutral-300"
      dir="rtl"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#f7eef2]">
        {cover ? (
          <SafeImage
            src={cover}
            alt=""
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {tag ? (
            <span className="inline-flex items-center rounded-full bg-[#fdeaf0] px-2.5 py-0.5 text-[11px] font-medium text-[#a92f5f]">
              {tag}
            </span>
          ) : null}
          {dateLabel ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <CalendarDays className="size-3 shrink-0" aria-hidden />
              {dateLabel}
            </span>
          ) : null}
        </div>
        <h3
          className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900 sm:text-base"
          style={sans}
        >
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-neutral-600 sm:text-[14px]" style={sans}>
          {post.excerpt}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-primary"
          style={sans}
        >
          اقرأ المقال
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function HomeBlogSection({ posts }: { posts: HomeBlogPostItem[] }) {
  if (posts.length === 0) return null;

  return (
    <section
      className="w-full py-14 md:py-20"
      style={{ backgroundColor: SECTION_BG }}
      aria-labelledby="home-blog-heading"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-xl text-start">
            <p
              className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-brand-primary md:text-sm"
              style={sans}
            >
              <BookOpen className="size-4 shrink-0" aria-hidden />
              المدونة
            </p>
            <h2
              id="home-blog-heading"
              className="text-2xl font-semibold leading-snug text-neutral-900 md:text-3xl"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              نصائح ومقالات العناية
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]" style={sans}>
              اختاري الأنسب لبشرتكِ من أحدث المقالات، من غسل الوجه إلى اختيار المنتج المناسب.
            </p>
          </div>
          <Link href="/blog" className="inline-flex w-fit shrink-0 qgb-btn-primary" style={sans} prefetch>
            تصفحي كل المقالات
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
