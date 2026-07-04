import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken, requireAdmin } from "@/lib/auth";
import { getBrands, saveBrands } from "@/lib/db-formula";

function getUser(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json(await getBrands());
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = await req.json();
  await saveBrands(body);
  return NextResponse.json({ success: true });
}
