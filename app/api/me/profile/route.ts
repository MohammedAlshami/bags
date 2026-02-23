import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const user = await User.findById(session.sub)
      .select("username email fullName address phone")
      .lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const body = await request.json();
    const updates: Record<string, string> = {};
    if (typeof body.email === "string") updates.email = body.email.trim();
    if (typeof body.fullName === "string") updates.fullName = body.fullName.trim();
    if (typeof body.address === "string") updates.address = body.address.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim();
    const user = await User.findByIdAndUpdate(
      session.sub,
      { $set: updates },
      { new: true }
    )
      .select("username email fullName address phone")
      .lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
