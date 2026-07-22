import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 使用 Web Crypto API 验证 JWT 签名（Edge Runtime 兼容）
async function verifyJwtSignature(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // 与 auth.ts 保持一致：生产环境无 JWT_SECRET 则拒绝，开发环境用 fallback
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === "production") {
        console.error("FATAL: JWT_SECRET 未设置，middleware 无法验证 token");
        return null;
      }
    }
    const secret = process.env.JWT_SECRET || "hiwen-mix-secret-key-dev-only";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) return null;

    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    return null;
  }
}

const NEW_DOMAIN = "hiwemix.com";
const REDIRECT_HOSTS = ["hiwe-formula-search.vercel.app", "www.hiwemix.com"];

export async function middleware(req: NextRequest) {
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
  const publicPaths = ["/login", "/api/auth/login", "/api/auth/register", "/_next", "/favicon.ico"];
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

  // 验证 token 是否存在且签名有效
  const payload = token ? await verifyJwtSignature(token) : null;
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 管理员 API 需要 admin 角色
  if (pathname.startsWith("/api/admin/")) {
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
