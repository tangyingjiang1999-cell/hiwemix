"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// SVG 图标组件（模块级，避免重渲染）
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

function SpinnerIcon() {
  return (
    <div className="flex justify-center mt-3">
      <div
        className="h-6 w-6 rounded-full border-2 border-indigo-200 border-t-indigo-500"
        style={{ animation: "spin 0.75s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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
    <div
      className="flex min-h-screen"
      style={{
        background: "linear-gradient(135deg, #4ECDC4 0%, #C471ED 60%, #d06af6 100%)",
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      }}
    >
      {/* ===== 左侧：品牌区域（桌面端） ===== */}
      <div className="hidden lg:flex lg:w-1/3 flex-col justify-between px-12 py-14 relative overflow-hidden">
        {/* 背景装饰圆 */}
        <div
          className="absolute -left-20 -top-32 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#ffffff" }}
        />
        <div
          className="absolute -right-16 -bottom-24 h-[300px] w-[300px] rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: "#E879F9" }}
        />

        {/* 主标题 */}
        <div className="relative z-10 mt-8">
          <h1
            className="text-white font-bold leading-tight"
            style={{
              fontSize: "44px",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome to
          </h1>
          <h1
            className="mt-1 text-white font-bold leading-tight"
            style={{
              fontSize: "52px",
              letterSpacing: "-1px",
            }}
          >
            HAIWE
          </h1>
          <h1
            className="mt-1 text-white font-bold leading-tight opacity-90"
            style={{
              fontSize: "40px",
              letterSpacing: "-0.5px",
            }}
          >
            Color System
          </h1>
        </div>

        {/* 左下角网站链接 */}
        <div className="relative z-10 mb-4">
          <p className="text-sm text-white/70">Our official website :</p>
          <a
            href="https://www.hiwe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-base font-semibold text-white transition-transform duration-200 ease-out hover:scale-110 hover:text-white/90"
            style={{
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.5)",
              textUnderlineOffset: "3px",
            }}
          >
            www.hiwe.com
          </a>
        </div>
      </div>

      {/* ===== 右侧：登录表单 ===== */}
      <div className="flex w-full items-center justify-center bg-white lg:w-2/3 px-8 py-14 sm:px-14 lg:px-20">
        <div className="w-full max-w-[380px]">
          {/* 移动端 Logo + 标题（仅小屏显示） */}
          <div className="mb-10 text-center lg:hidden">
            <img
              src="/haiwen-logo.png"
              alt="HAIWEN"
              className="mx-auto h-[168px] w-auto object-contain"
            />
            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Welcome to HAIWE
            </h1>
          </div>

          {/* 桌面端 Logo */}
          <div className="mb-10 hidden lg:flex justify-center">
            <img
              src="/haiwen-logo.png"
              alt="HAIWEN"
              className="h-60 w-auto object-contain"
            />
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div className="group relative mb-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0">
                <UserIcon />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
                autoFocus
                className="peer h-11 w-full border-b-2 border-gray-200 bg-transparent py-2 pl-9 pr-3 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="group relative mb-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0">
                <LockIcon />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="peer h-11 w-full border-b-2 border-gray-200 bg-transparent py-2 pl-9 pr-10 text-[15px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Get started 按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 h-12 w-full rounded-lg text-base font-medium text-white shadow-md shadow-indigo-300/50 transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-lg hover:shadow-indigo-300/60"
              style={{
                backgroundColor: loading ? "#7C6FBF" : "#6366F1",
              }}
            >
              {loading ? "Signing in..." : "Get started"}
            </button>

            {/* Loading spinner */}
            {loading && <SpinnerIcon />}
          </form>
        </div>
      </div>
    </div>
  );
}
