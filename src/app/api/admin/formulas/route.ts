import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { getFormulas, saveFormula, deleteFormula } from "@/lib/db-formula";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  return NextResponse.json(await getFormulas());
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  if (!body.id || !body.color_id) {
    return NextResponse.json({ error: "缺少必填字段（id/color_id）" }, { status: 400 });
  }
  const saved = await saveFormula(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const saved = await saveFormula(body);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await deleteFormula(id);
  return NextResponse.json({ success: true });
}
