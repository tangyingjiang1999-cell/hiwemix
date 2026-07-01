import { NextRequest, NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-helpers";

// KV 未配置时的默认管理员兜底
const FALLBACK_ADMIN = { id: 1, username: "admin", password_hash: "$2a$10$" };

function fallbackLogin(username: string, password: string) {
  if (username === FALLBACK_ADMIN.username && password === "admin123") {
    const user = FALLBACK_ADMIN;
    return { id: user.id, username: user.username, role: "admin" };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  try {
    // 尝试从 Vercel KV 验证
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
    // KV 未配置时，使用默认管理员账号
    const fallbackUser = fallbackLogin(username, password);
    if (!fallbackUser) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }
    const token = signToken(fallbackUser);
    const res = NextResponse.json({
      success: true,
      user: fallbackUser,
    });
    setAuthCookie(res, token);
    return res;
  }
}
