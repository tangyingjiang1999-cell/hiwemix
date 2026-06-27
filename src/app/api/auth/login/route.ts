import { NextRequest, NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";

// 内置管理员账号（无需数据库）
const BUILTIN_USERS: Record<string, { password: string; role: string }> = {
  admin: { password: "admin123", role: "admin" },
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  const builtin = BUILTIN_USERS[username];
  if (!builtin || builtin.password !== password) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const user = { id: 1, username, role: builtin.role };
  const token = signToken(user);
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
  });
  setAuthCookie(res, token);
  return res;
}
