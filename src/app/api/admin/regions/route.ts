import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { Region } from "@/types";

// GET /api/admin/regions - Get all regions (requires admin)
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { data, error } = await supabaseAdmin
    .from("regions")
    .select("code")
    .order("code", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const regions: Region[] = (data ?? []).map((r) => ({ code: r.code }));
  return NextResponse.json(regions);
}

// POST /api/admin/regions - Create new region (requires admin)
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = (await req.json()) as { code?: string };
  if (!body.code || !body.code.trim()) {
    return NextResponse.json({ error: "缺少产地代码" }, { status: 400 });
  }

  const code = body.code.trim().toUpperCase();
  if (code.length > 10) {
    return NextResponse.json({ error: "产地代码不能超过 10 个字符" }, { status: 400 });
  }

  // Check if region already exists
  const { data: existing } = await supabaseAdmin
    .from("regions")
    .select("code")
    .eq("code", code)
    .single();

  if (existing) {
    return NextResponse.json({ error: "产地代码已存在" }, { status: 400 });
  }

  // Insert new region
  const { data, error } = await supabaseAdmin
    .from("regions")
    .insert({ code })
    .select("code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const region: Region = { code: data.code };
  return NextResponse.json(region, { status: 201 });
}

// DELETE /api/admin/regions - Delete region (requires admin)
export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const body = (await req.json()) as { code?: string };
  if (!body.code) {
    return NextResponse.json({ error: "缺少产地代码" }, { status: 400 });
  }

  const code = body.code;

  // Check if any brands are using this region
  const { data: brandsWithRegion, error: checkError } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("region", code)
    .limit(1);

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (brandsWithRegion && brandsWithRegion.length > 0) {
    return NextResponse.json(
      { error: "该产地下还有关联的品牌，无法删除" },
      { status: 400 }
    );
  }

  // Delete region
  const { error } = await supabaseAdmin
    .from("regions")
    .delete()
    .eq("code", code);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
