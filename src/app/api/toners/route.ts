import { NextResponse } from "next/server";
import { getToners } from "@/lib/db-toner";

// 色母数据变动后自动失效缓存，使配方编辑器的下拉实时反映最新数据
export async function GET() {
  const toners = await getToners();
  return NextResponse.json(toners, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
