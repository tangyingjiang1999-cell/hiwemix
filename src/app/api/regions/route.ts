import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import type { Region } from "@/types";

// GET /api/regions - Get all regions (public, no auth required)
export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from("regions")
    .select("code")
    .order("code", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const regions: Region[] = (data ?? []).map((r) => ({ code: r.code }));
  return NextResponse.json(regions);
}
