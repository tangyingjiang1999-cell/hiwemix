"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLang } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, User, Lock, Eye, EyeOff, ArrowLeft, Globe, MessageCircle, Share2, Camera } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const { t } = useLang();
  const { login } = useAuth();

  async function attemptLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user) login(data.user);
      router.push("/");
      return true;
    }
    setError(data.error || t.loginErrorFailed);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError(t.loginErrorEmpty);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (password.length < 8) {
          setError(t.registerErrorPassword);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t.registerErrorMismatch);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, confirmPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await attemptLogin();
        } else {
          setError(data.error || t.registerErrorFailed);
        }
      } else {
        await attemptLogin();
      }
    } catch {
      setError(isRegister ? t.registerErrorFailed : t.loginErrorNetwork);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip lg:flex-row">
      {/* ===== 左侧背景区 (40%) — 珍珠漆图片背景 ===== */}
      <div className="relative hidden w-full flex-col justify-between bg-cover bg-center px-5 py-6 lg:flex lg:w-[40%]"
        style={{ backgroundImage: "url('/car-paint.jpg')" }}
      >
        {/* 半透明遮罩提升文字可读性 */}
        <div className="absolute inset-0 bg-black/20" />

        {/* 主标题 */}
        <div className="relative z-10 text-left">
          <h1
            className="text-[70px] font-extrabold uppercase leading-[1.1] tracking-[2px] text-white xl:text-[82px]"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Welcome to
          </h1>
          <h1
            className="text-[70px] font-extrabold uppercase leading-[1.1] tracking-[2px] text-white xl:text-[82px]"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            HIWEMIX
          </h1>
        </div>

        {/* 底部社交图标 */}
        <div className="relative z-10 flex items-center gap-1">
          <a
            href="https://www.hiwe.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-white/75"
          >
            <Globe className="size-5" />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=8615819205996"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-white/75"
          >
            <MessageCircle className="size-5" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61550592422623"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-white/75"
          >
            <Share2 className="size-5" />
          </a>
          <a
            href="https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-white/75"
          >
            <Camera className="size-5" />
          </a>
        </div>
      </div>

      {/* ===== 右侧表单区 (60%) ===== */}
      <div className="relative flex flex-1 items-center justify-center bg-white px-6 py-10 lg:px-5">
        {/* 注册模式返回箭头 */}
        {isRegister && (
          <button
            onClick={() => {
              setIsRegister(false);
              setError("");
              setConfirmPassword("");
            }}
            aria-label={t.backToLogin}
            className="absolute left-3 top-6 inline-flex items-center justify-center text-black transition-colors hover:text-gray-600 lg:left-9 lg:top-[50px]"
          >
            <ArrowLeft className="size-6 lg:size-7" />
          </button>
        )}

        <div className="w-full max-w-[360px]">
          {/* Logo — 水平居中在表单正上方，向上平移 30px */}
          <div className="mb-2 flex justify-center lg:-mt-[30px]">
            <Image
              src="/hiwe.png"
              alt="HIWE"
              width={1206}
              height={334}
              className="h-10 w-auto object-contain lg:h-14"
            />
          </div>

          {/* 表单卡片 — Dub.co 极简风格 */}
          <Card className="border-gray-200/60 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} aria-label={isRegister ? t.registerButton : t.loginButton} className="flex flex-col gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      autoFocus
                      autoComplete="off"
                      className={cn(
                        "h-10 rounded-xl pl-9",
                        isRegister ? "focus-visible:border-purple-500 focus-visible:ring-purple-500/20" : ""
                      )}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      className={cn(
                        "h-10 rounded-xl pl-9 pr-9",
                        isRegister ? "focus-visible:border-purple-500 focus-visible:ring-purple-500/20" : ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (注册模式) */}
                {isRegister && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        className="h-10 rounded-xl pl-9 pr-9 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error 提示 */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* 提交按钮 */}
                <Button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className={cn(
                    "h-10 w-full rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] hover:opacity-90",
                    isRegister
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-[#2487ca] hover:bg-[#1d6fb0]"
                  )}
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : isRegister ? (
                    t.registerButton
                  ) : (
                    t.loginButton
                  )}
                </Button>

                {/* 模式切换链接 */}
                <p className="text-center text-sm text-gray-500">
                  {isRegister ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(false);
                        setError("");
                        setConfirmPassword("");
                      }}
                      className={cn(
                        "font-medium transition-colors hover:underline",
                        isRegister ? "text-purple-600 hover:text-purple-700" : "text-[#2487ca] hover:text-[#1d6fb0]"
                      )}
                    >
                      {t.registerLoginLink}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setError("");
                      }}
                      className="font-medium text-[#2487ca] transition-colors hover:text-[#1d6fb0] hover:underline"
                    >
                      {t.loginRegisterLink}
                    </button>
                  )}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
