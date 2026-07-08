import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getVariants, saveVariant, deleteVariant } from "@/lib/db-formula";
import type { ColorVariant } from "@/types";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getVariants());
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as ColorVariant;
  if (!body.id || !body.name || !body.year_range) {
    return NextResponse.json({ error: "缺少必填字段（id/name/year_range）" }, { status: 400 });
  }
  const saved = await saveVariant(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as ColorVariant;
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveVariant(body);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteVariant(id);
  return NextResponse.json({ success: true });
}
