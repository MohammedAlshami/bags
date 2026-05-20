import { NextResponse } from "next/server";
import { getAllSocialLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";

export async function GET() {
  const links = await getAllSocialLinks();
  return NextResponse.json(links);
}
