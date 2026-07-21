import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { applyRateLimit, ADMIN_LIMIT } from "@/lib/rate-limit";
import { getToners, saveToner, deleteToner } from "@/lib/db-toner";
import type { Toner } from "@/types";

export async function GET(req: NextRequest) {
  const limitRes = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes) return limitRes;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getToners());
}

export async function POST(req: NextRequest) {
  const limitRes = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes) return limitRes;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  let body: Toner;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!body.code || !body.tradeName || !body.nameZh || !body.category) {
    return NextResponse.json({ error: "缺少必填字段（code/tradeName/nameZh/category）" }, { status: 400 });
  }

  const saved = await saveToner(body);
  revalidatePath("/api/toners");
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const limitRes = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes) return limitRes;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  let body: Toner;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!body.code) {
    return NextResponse.json({ error: "缺少 code" }, { status: 400 });
  }

  const saved = await saveToner(body);
  revalidatePath("/api/toners");
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const limitRes = applyRateLimit(req, ADMIN_LIMIT);
  if (limitRes) return limitRes;
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { code } = body;
  if (!code) return NextResponse.json({ error: "缺少 code" }, { status: 400 });

  await deleteToner(code);
  revalidatePath("/api/toners");
  return NextResponse.json({ success: true });
}
