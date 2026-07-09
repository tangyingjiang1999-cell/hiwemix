"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLang } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";

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

// 与后端保持一致：字母开头，3-20 位，仅字母、数字、下划线
const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = useLang();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!USERNAME_RE.test(username)) {
      setError(t.registerErrorFormat);
      return;
    }
    if (password.length < 8) {
      setError(t.registerErrorPassword);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.registerErrorMismatch);
      return;
    }
    setLoading(true);
    try {
      // 1) 注册
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setError(regData.error || t.registerErrorFailed);
        return;
      }
      // 2) 注册成功后自动登录
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.success && loginData.user) {
        login(loginData.user);
        router.push("/");
      } else {
        // 注册成功但自动登录失败，跳登录页由用户手动登录
        router.push("/login");
      }
    } catch {
      setError(t.loginErrorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ===== 左侧渐变区 (40%) ===== */}
      <div className="fluid-gradient relative flex flex-col justify-between px-6 py-8 lg:px-10 lg:py-12 lg:w-[40%]">
        <div className="fluid-blob" />
        <div className="relative z-10 flex items-center gap-3 lg:hidden">
          <Image src="/haiwen-logo.png" alt="HAIWEN" width={40} height={40} className="h-10 w-10 object-contain brightness-0 invert" />
          <span className="text-base font-semibold text-white">HAIWEN MIX</span>
        </div>
        <div className="relative z-10 hidden lg:block text-left">
          <h1 className="text-white" style={{ fontFamily: "Arial, sans-serif", fontSize: "52px", fontWeight: 700, letterSpacing: "2px", lineHeight: 1.1 }}>
            HAIWEN MIX
          </h1>
          <p className="text-white" style={{ fontFamily: "Arial, sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "3px", marginTop: "4px" }}>
            {t.brandSlogan}
          </p>
        </div>
        <div className="relative z-10 hidden lg:block">
          <a href="https://www.hiwe.com" target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-white transition-colors hover:text-white/80" style={{ color: "white", textDecoration: "underline", textUnderlineOffset: "3px", fontFamily: "Arial, sans-serif" }}>
            {t.officialWebsite} www.hiwe.com
          </a>
        </div>
      </div>

      {/* ===== 右侧表单区 (60%) ===== */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 hidden lg:block text-center">
            <Image src="/haiwen-logo.png" alt="HAIWEN" width={80} height={80} className="mx-auto h-20 w-auto object-contain mb-6" />
            <h2 className="mt-2 text-base font-semibold text-gray-900">{t.registerTitle}</h2>
          </div>
          <div className="mb-8 lg:hidden">
            <Image src="/haiwen-logo.png" alt="HAIWEN" width={56} height={56} className="mb-4 h-14 w-auto object-contain" />
            <h1 className="text-base font-semibold text-gray-900">{t.registerTitle}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">{t.loginEmail}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  name="username"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.loginPlaceholderEmail}
                  autoFocus
                  className="block h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-xs text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">{t.loginPassword}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.loginPlaceholderPassword}
                  className="block h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-xs text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">{t.registerConfirmLabel}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.registerConfirmPlaceholder}
                  className="block h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-xs text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0D9488] text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0F766E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.loginSigningIn}
                </span>
              ) : (
                t.registerButton
              )}
            </button>

            {/* 已有账号？去登录 */}
            <p className="text-center text-xs text-gray-500">
              <a href="/login" className="font-medium text-[#0D9488] hover:text-[#0F766E]">{t.registerLoginLink}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
