import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAuth } from "@/lib/auth";
import { getGuideCategories, getGuides } from "@/lib/db-guide";

// 公开读（登录用户即可访问），供 Application Guide 页面加载
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const unauthorized = requireAuth(user);
  if (unauthorized) return unauthorized;
  const [categories, guides] = await Promise.all([getGuideCategories(), getGuides()]);
  return NextResponse.json({ categories, guides });
}
