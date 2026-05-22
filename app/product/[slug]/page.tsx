import type { Metadata } from "next";
import { sql } from "@/lib/db";
import { parseIdParam } from "@/lib/slugs";
import ProductClient from "./client";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseIdParam(slug);
  const rows = await sql`
    SELECT name, description_ar, image FROM products WHERE id = ${id} LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { title: "المنتج غير متوفر" };
  }
  const name = String(row.name ?? "");
  const image = String(row.image ?? "");
  const description = String(row.description_ar ?? "") || `منتج ${name} من الملكة جولد — عناية مختارة بعناية.`;
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : [{ url: "/logo_img.png", width: 512, height: 512 }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductClient slug={slug} />;
}
