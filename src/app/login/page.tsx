"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function UserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ===== 左侧品牌区 (40%) ===== */}
      <div
        className="relative flex flex-col justify-between px-10 py-12 lg:w-[40%]"
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #0D9488 100%)",
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
        }}
      >
        {/* 背景装饰圆 */}
        <div className="pointer-events-none absolute -left-20 -top-32 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />

        {/* 移动端 - 仅在手机显示紧凑头部 */}
        <div className="relative z-10 flex items-center gap-3 lg:hidden">
          <img
            src="/haiwen-logo.png"
            alt="HAIWEN"
            className="h-10 w-10 object-contain brightness-0 invert"
          />
          <span className="text-lg font-bold tracking-wide text-white">
            HAIWEN MIX
          </span>
        </div>

        {/* 桌面端 - 品牌大区 */}
        <div className="relative z-10 hidden lg:block">
          <img
            src="/haiwen-logo.png"
            alt="HAIWEN"
            className="mb-8 h-28 w-auto object-contain brightness-0 invert"
          />
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
            HAIWEN
          </h1>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white/90">
            MIX
          </h1>
          <p className="mt-4 text-lg font-medium text-white/70">
            Car Refinish Formula System
          </p>
        </div>

        {/* 底部链接 */}
        <div className="relative z-10">
          <a
            href="https://www.hiwe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-white/70 transition-colors hover:text-white"
            style={{
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            www.hiwe.com
          </a>
        </div>
      </div>

      {/* ===== 右侧表单区 (60%) ===== */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 lg:px-16">
        <div className="w-full max-w-sm">
          {/* 桌面端小标题 */}
          <div className="mb-10 hidden lg:block">
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
              Sign In
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials to access the system
            </p>
          </div>

          {/* 移动端 - 品牌区不显示的标题 */}
          <div className="mb-8 lg:hidden">
            <img
              src="/haiwen-logo.png"
              alt="HAIWEN"
              className="mb-4 h-14 w-auto object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">
              Welcome to HAIWEN
            </h1>
            <p className="mt-1 text-sm text-gray-500">Formula Search</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email / Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="block h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Get started 按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0D9488] text-base font-semibold text-white transition-all duration-200 hover:bg-[#0F766E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Get started"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
