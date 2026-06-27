import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken, requireAdmin } from "@/lib/auth";

function getUser(req: NextRequest): { userId: number; username: string; role: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

// 内置用户列表（无需数据库）
const BUILTIN_USERS = [
  { id: 1, username: "admin", role: "admin", created_at: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json(BUILTIN_USERS);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  // 当前为内置账号模式，暂不支持通过 API 新建用户
  return NextResponse.json({ error: "当前模式不支持创建用户，请修改代码中的 BUILTIN_USERS" }, { status: 501 });
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json({ error: "当前模式不支持编辑用户，请修改代码中的 BUILTIN_USERS" }, { status: 501 });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  return NextResponse.json({ error: "当前模式不支持删除用户" }, { status: 501 });
}
