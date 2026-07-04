"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 管理端路由守卫：非管理员用户无法访问任何 /admin/* 页面
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          // 未登录 → 跳转登录页
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (!data.authenticated || data.user.role !== "admin") {
          // 已登录但非管理员 → 跳转首页
          router.push("/");
          return;
        }
        setAllowed(true);
      })
      .finally(() => setChecking(false));
  }, [router]);

  // 权限校验中，显示加载状态
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // 校验未通过时不渲染任何内容（等待 redirect）
  if (!allowed) return null;

  return <>{children}</>;
}
