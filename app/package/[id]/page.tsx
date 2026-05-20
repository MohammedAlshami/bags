import type { Metadata } from "next";
import { sql } from "@/lib/db";
import PackageClient from "./client";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rows = await sql`
    SELECT name, description, image FROM packages WHERE id = ${id}::uuid LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { title: "الباقة غير متوفرة" };
  }
  const name = String(row.name ?? "");
  const image = String(row.image ?? "");
  const description = String(row.description ?? "") || `باقة ${name} من الملكة جولد — مجموعة عناية متكاملة بسعر خاص.`;
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

export default async function PackagePage({ params }: Props) {
  const { id } = await params;
  return <PackageClient id={id} />;
}
