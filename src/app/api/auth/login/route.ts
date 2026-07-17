import { NextRequest, NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword, initDefaultAdmin } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  let username: string, password: string;
  try {
    const body = await req.json();
    username = body.username;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  // 确保默认管理员账号存在
  await initDefaultAdmin();

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    const tokenData = { id: user.id, username: user.username, role: user.role };
    const token = signToken(tokenData);
    const res = NextResponse.json({
      success: true,
      user: { id: tokenData.id, username: tokenData.username, role: tokenData.role },
    });
    setAuthCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "登录服务暂不可用" }, { status: 503 });
  }
}
