import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 简单解码 JWT payload（不验证签名，仅用于中间件路由判断）
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload;
  } catch {
    return null;
  }
}

const NEW_DOMAIN = "hiwemix.com";
const REDIRECT_HOSTS = ["hiwe-formula-search.vercel.app", "www.hiwemix.com"];

export function middleware(req: NextRequest) {
  const { pathname, host } = req.nextUrl;

  // 旧域名 / www 统一 301 永久重定向到主域名
  if (REDIRECT_HOSTS.includes(host)) {
    const newUrl = new URL(pathname + req.nextUrl.search, `https://${NEW_DOMAIN}`);
    return NextResponse.redirect(newUrl, 301);
  }

  // 静态资源文件（图片、字体等）直接放行
  if (/\.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff2?|ttf|eot)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 公开路由，不需要认证
  const publicPaths = ["/login", "/api/auth/login", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 获取 token
  let token: string | undefined;
  const cookie = req.cookies.get("auth_token")?.value;
  if (cookie) {
    token = cookie;
  } else {
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      token = auth.slice(7);
    }
  }

  // 验证 token 是否存在且格式正确
  if (!token || !decodeJwtPayload(token)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 管理员 API 需要 admin 角色
  if (pathname.startsWith("/api/admin/")) {
    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
