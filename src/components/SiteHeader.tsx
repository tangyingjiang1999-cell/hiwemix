"use client";

import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AuthUser {
  username: string;
  role: string;
}

interface SiteHeaderProps {
  subtitle?: string;
}

export default function SiteHeader({ subtitle }: SiteHeaderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setAuthUser(data.user);
        }
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <header
      className="flex h-auto min-h-[64px] flex-col items-center gap-2 px-4 py-3 sm:h-[96px] sm:flex-row sm:px-[40px]"
      style={{ background: "linear-gradient(to right, #8B5CF6, #0D9488)" }}
    >
      <div className="flex items-center gap-3">
        <img
          src="/haiwen.png"
          alt="HAIWEN"
          className="h-10 w-10 object-contain brightness-0 invert sm:h-[54px] sm:w-[54px]"
        />
        <span className="text-muji-title text-white">
          HAIWEN MIX{subtitle ? ` ${subtitle}` : ""}
        </span>
      </div>

      <div className="ml-0 flex items-center gap-3 sm:ml-auto sm:gap-4">
        {authUser && (
          <div className="flex items-center gap-2">
            <span className="text-muji-micro text-white/80 sm:text-muji-caption">
              {authUser.username}
              {authUser.role === "admin" && (
                <a
                  href="/admin/users"
                  className="ml-1 text-[10px] text-white/60 hover:text-white sm:ml-2"
                >
                  管理
                </a>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="rounded border border-white/40 px-2 py-0.5 text-muji-micro text-white transition-colors hover:bg-white/10 sm:px-3 sm:py-1"
            >
              退出
            </button>
          </div>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
