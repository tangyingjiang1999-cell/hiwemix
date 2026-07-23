import { NextRequest, NextResponse } from "next/server";
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
  try {
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
    return NextResponse.json(saved, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[POST /api/admin/toners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
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
    return NextResponse.json(saved);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PUT /api/admin/toners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
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
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[DELETE /api/admin/toners]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
