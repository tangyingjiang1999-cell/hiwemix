import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getGuideCategories, saveGuideCategory, deleteGuideCategory } from "@/lib/db-guide";
import type { GuideCategory } from "@/types";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getGuideCategories());
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as GuideCategory;
  if (!body.id || !body.name || !body.nameZh) {
    return NextResponse.json({ error: "缺少必填字段（id/name/nameZh）" }, { status: 400 });
  }
  const saved = await saveGuideCategory(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as GuideCategory;
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveGuideCategory(body);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteGuideCategory(id);
  return NextResponse.json({ success: true });
}
