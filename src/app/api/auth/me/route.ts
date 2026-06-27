import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, clearAuthCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  clearAuthCookie(res);
  return res;
}
