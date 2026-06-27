import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth-helpers";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
  }

  const user = await getUserByUsername(username);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const token = signToken(user);
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
  });
  setAuthCookie(res, token);
  return res;
}
