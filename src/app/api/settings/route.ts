import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/db-formula";

// 公开读（登录用户即可访问），供 SearchPanel 加载自定义参数
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  const unauthorized = requireAuth(user);
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getSettings());
}
