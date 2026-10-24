import { NextResponse } from "next/server";
import { requireAdmin, requireSuperadmin } from "@/lib/auth";

/** Returns a 403 response when the caller isn't an admin, otherwise null. Use at the top of mutating handlers. */
export async function adminGuard(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

/**
 * Destructive maintenance endpoints (seed/backfill): disabled unless ALLOW_DB_SEED=1 is set,
 * and even then only a superadmin may call them.
 */
export async function seedGuard(): Promise<NextResponse | null> {
  if (process.env.ALLOW_DB_SEED !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await requireSuperadmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
