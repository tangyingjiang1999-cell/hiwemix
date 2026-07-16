import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getColors, saveColor, deleteColor, saveColorYears } from "@/lib/db-formula";
import type { Color } from "@/types";

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
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }
  const { variantIds, years, ...rest } = body;
  const color = rest as unknown as Omit<Color, "variants">;
  if (!color.id || !color.make_id || !color.color_code) {
    return NextResponse.json({ error: "缺少必填字段（id/make_id/color_code）" }, { status: 400 });
  }
  const saved = await saveColor(color, (variantIds as string[]) ?? []);

  // 保存年份
  if (years && Array.isArray(years)) {
    await saveColorYears(color.id, years as number[]);
  }

  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }
  const { variantIds, years, ...rest } = body;
  const color = rest as unknown as Omit<Color, "variants">;
  if (!color.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveColor(color, (variantIds as string[]) ?? []);

  // 保存年份
  if (years && Array.isArray(years)) {
    await saveColorYears(color.id, years as number[]);
  }

  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  let body: { id?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteColor(id);
  return NextResponse.json({ success: true });
}
