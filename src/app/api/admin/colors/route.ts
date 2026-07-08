import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getColors, saveColor, deleteColor } from "@/lib/db-formula";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getColors());
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { variantIds, ...color } = body;
  if (!color.id || !color.make_id || !color.color_code) {
    return NextResponse.json({ error: "缺少必填字段（id/make_id/color_code）" }, { status: 400 });
  }
  const saved = await saveColor(color, variantIds ?? []);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { variantIds, ...color } = body;
  if (!color.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveColor(color, variantIds ?? []);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteColor(id);
  return NextResponse.json({ success: true });
}
