import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth";
import { handleImageUpload } from "@/lib/upload-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireCustomer();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return handleImageUpload(request);
}
