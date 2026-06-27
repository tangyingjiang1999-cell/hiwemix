"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: "#f5f5f7" }}
    >
      {/* Apple 风格登录卡片 - 无阴影、无硬边框 */}
      <div
        className="w-full max-w-[380px] rounded-2xl bg-white p-10"
        style={{
          boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <img
            src="/haiwen-logo.png"
            alt="HAIWEN"
            className="h-16 w-auto object-contain sm:h-20"
          />
        </div>

        {/* 标题 - Apple 标题风格：SF Pro Display 600, 负字距 */}
        <div className="mb-8 text-center">
          <h1
            className="text-[28px] font-semibold tracking-tight sm:text-[34px]"
            style={{
              color: "#1d1d1f",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              letterSpacing: "-0.374px",
              lineHeight: "1.19",
            }}
          >
            登录
          </h1>
          <p
            className="mt-2 text-base"
            style={{
              color: "#7a7a7a",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
              letterSpacing: "-0.224px",
            }}
          >
            HAIWEN MIX 配方检索系统
          </p>
        </div>

        {/* 表单 - Apple 输入风格 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium"
              style={{
                color: "#1d1d1f",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: "14px",
                letterSpacing: "-0.224px",
              }}
            >
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              autoFocus
              className="mt-1.5 h-11 w-full rounded-full border px-4 text-base outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              style={{
                borderColor: "rgba(0,0,0,0.12)",
                backgroundColor: "#fff",
                color: "#1d1d1f",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: "17px",
                letterSpacing: "-0.374px",
                lineHeight: "1.47",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium"
              style={{
                color: "#1d1d1f",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: "14px",
                letterSpacing: "-0.224px",
              }}
            >
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="mt-1.5 h-11 w-full rounded-full border px-4 text-base outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              style={{
                borderColor: "rgba(0,0,0,0.12)",
                backgroundColor: "#fff",
                color: "#1d1d1f",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: "17px",
                letterSpacing: "-0.374px",
                lineHeight: "1.47",
              }}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                color: "#c41e3a",
                backgroundColor: "#fef2f2",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              {error}
            </p>
          )}

          {/* Apple 风格按钮：药丸形、Action Blue、scale(0.95) 按压效果 */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full py-3 text-base font-normal transition-all active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: loading ? "#5ac8fa" : "#0066cc",
              color: "#ffffff",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "17px",
              fontWeight: 400,
              letterSpacing: "-0.374px",
              lineHeight: "1.47",
            }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {/* 底部说明 - Apple fine-print 风格 */}
        <p
          className="mt-8 text-center text-xs leading-relaxed"
          style={{
            color: "#7a7a7a",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            letterSpacing: "-0.08px",
          }}
        >
          仅授权用户可访问此系统 · HAIWEN MIX &copy; 2026
        </p>
      </div>
    </div>
  );
}
