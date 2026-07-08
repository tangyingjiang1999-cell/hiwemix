import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getBrands, saveBrand, deleteBrand } from "@/lib/db-formula";
import type { CarMake } from "@/types";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getBrands());
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as CarMake;
  if (!body.id || !body.name || !body.region) {
    return NextResponse.json({ error: "缺少必填字段（id/name/region）" }, { status: 400 });
  }
  const saved = await saveBrand(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = (await req.json()) as CarMake;
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveBrand(body);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteBrand(id);
  return NextResponse.json({ success: true });
}
