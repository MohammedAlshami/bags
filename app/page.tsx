import type { Metadata } from "next";
import { HomePageClient } from "./components/HomePageClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import type { SocialReelProduct } from "./components/SocialMediaSection";
import type { ReviewProductRef } from "./components/HomeReviewsSection";
import type { FeaturedProductItem } from "./components/FeaturedProductsClient";
import type { HomeCategorySectionData } from "./components/HomeCategoryProductSections";
import { mapBlogPost, type BlogPostRow } from "@/lib/blog";
import type { HomeBlogPostItem } from "./components/HomeBlogSection";
import { getActiveHeroImages } from "@/lib/hero-images-api";
import { getActiveFaqItems } from "@/lib/faq-items";
import { getBeforeAfterImages } from "@/lib/before-after";
import { getActiveReviews } from "@/lib/reviews";

// Rendered per request: the hero, FAQ, reviews and products are admin-edited and must show up without a redeploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description:
    "اكتشفي تشكيلة واسعة من منتجات العناية بالبشرة والجمال من الملكة جولد. عطور، مكياج، كريمات عناية — مع خدمة التوصيل إلى اليمن والسعودية.",
  openGraph: {
    description:
      "اكتشفي تشكيلة واسعة من منتجات العناية بالبشرة والجمال من الملكة جولد. عطور، مكياج، كريمات عناية — مع خدمة التوصيل إلى اليمن والسعودية.",
    images: [{ url: "/logo_img.png", width: 512, height: 512 }],
  },
};

type RankedProductRow = ProductRow & { rn: number };

function rowToFeaturedItem(row: ProductRow): FeaturedProductItem {
  const mapped = mapProduct(row, true);
  return {
    slug: mapped._id,
    image: mapped.image,
    category: mapped.category,
    name: mapped.name,
    saudiRiyal: mapped.saudiRiyal,
    oldRiyal: mapped.oldRiyal,
    sizes: mapped.sizes as FeaturedProductItem["sizes"],
  };
}

export default async function Home() {
  // All queries are independent: fire them together instead of paying D1 latency five times in a row.
  const categoriesQuery = sql`
    SELECT id, name, sort_order
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `;

  const rankedQuery = sql`
    WITH ranked AS (
      SELECT
        p.id, p.name, p.saudi_riyal, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
        p.created_at, p.updated_at,
        cat.id AS cat_id, cat.name AS cat_name,
        c.id AS col_id, c.name AS col_name, c.slug AS col_slug,
        ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created_at DESC) AS rn
      FROM products p
      INNER JOIN categories cat ON cat.id = p.category_id
      LEFT JOIN collections c ON c.id = p.collection_id
    )
    SELECT * FROM ranked WHERE rn <= 8 ORDER BY cat_id, rn
  `;

  const recentQuery = sql`
    SELECT p.id, p.name, p.saudi_riyal, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;

  // Only products that an active review points at are needed for the review cards.
  const reviewProductsQuery = sql`
    SELECT id, name, image FROM products
    WHERE id IN (SELECT product_id FROM reviews WHERE is_active = 1 AND product_id IS NOT NULL)
  `;

  const blogsQuery = sql`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC
    LIMIT 3
  `;

  const [
    categoryRows,
    rankedRowsRaw,
    recentRows,
    reviewProductRows,
    blogRows,
    heroImages,
    faqItems,
    beforeAfterImages,
    reviewsList,
  ] = await Promise.all([
    categoriesQuery,
    rankedQuery,
    recentQuery,
    reviewProductsQuery,
    blogsQuery,
    getActiveHeroImages(),
    getActiveFaqItems(),
    getBeforeAfterImages(),
    getActiveReviews(),
  ]);

  const categories = categoryRows as { id: string; name: string; sort_order: number }[];
  const rankedRows = rankedRowsRaw as RankedProductRow[];

  const byCategoryId = new Map<string, FeaturedProductItem[]>();
  for (const row of rankedRows) {
    const cid = row.cat_id ?? row.category_id;
    if (!cid) continue;
    const list = byCategoryId.get(cid) ?? [];
    list.push(rowToFeaturedItem(row));
    byCategoryId.set(cid, list);
  }

  const categorySections: HomeCategorySectionData[] = categories
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      products: byCategoryId.get(c.id) ?? [],
    }))
    .filter((s) => s.products.length > 0);

  const shopByCategoryItems: ShopByCategoryStripItem[] = categories.slice(0, 6).map((c) => ({
    categoryId: c.id,
    label: c.name,
    imageSrc: byCategoryId.get(c.id)?.[0]?.image ?? null,
  }));

  const productRows = recentRows as ProductRow[];

  const socialReelProducts: SocialReelProduct[] = productRows.slice(0, 4).map((row) => {
    const mapped = mapProduct(row, true);
    const size =
      Array.isArray(mapped.sizes) && mapped.sizes.length > 0 ? mapped.sizes[0]! : null;
    return {
      slug: mapped._id,
      name: mapped.name,
      image: mapped.image,
      saudiRiyal: mapped.saudiRiyal,
      oldRiyal: mapped.oldRiyal ?? null,
      size,
    };
  });

  const reviewProducts: ReviewProductRef[] = (reviewProductRows as { id: string; name: string; image: string }[]).map((row) => ({
    slug: row.id,
    name: row.name,
    image: row.image,
  }));

  const homeBlogPosts: HomeBlogPostItem[] = (blogRows as BlogPostRow[]).map((row) => {
    const p = mapBlogPost(row);
    return {
      _id: p._id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      tags: p.tags,
    };
  });

  return (
    <HomePageClient
      shopByCategoryItems={shopByCategoryItems}
      categorySections={categorySections}
      socialReelProducts={socialReelProducts}
      reviewProducts={reviewProducts}
      homeBlogPosts={homeBlogPosts}
      heroSlides={heroImages.map((h) => h.imageUrl)}
      faqItems={faqItems.map((f) => ({ _id: f._id, question: f.question, answer: f.answer }))}
      beforeAfterImages={beforeAfterImages}
      reviews={reviewsList}
    />
  );
}
