import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, clearAuthCookie, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const user = verifyToken(token);
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
