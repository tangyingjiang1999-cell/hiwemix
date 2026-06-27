import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDb, User } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "hiwen-mix-secret-key-change-in-production";

export interface AuthToken {
  userId: number;
  username: string;
  role: string;
}

export function signToken(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // 优先从 cookie 读取
  const cookie = req.cookies.get("auth_token")?.value;
  if (cookie) return cookie;
  // 降级从 Authorization header 读取
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export function getUserFromRequest(req: NextRequest): AuthToken | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: "/",
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// 检查请求是否已认证，未认证返回 401 响应
export function requireAuth(req: NextRequest): { user: AuthToken; res: null } | { user: null; res: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) {
    return { user: null, res: NextResponse.json({ error: "unauthenticated" }, { status: 401 }) };
  }
  return { user, res: null };
}

// 检查是否为管理员，否则返回 403
export function requireAdmin(req: NextRequest): { user: AuthToken; res: null } | { user: null; res: NextResponse } {
  const auth = requireAuth(req);
  if (auth.res) return { user: null, res: auth.res };
  if (auth.user!.role !== "admin") {
    return { user: null, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user: auth.user!, res: null };
}
