"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/AuthContext";

interface SiteHeaderProps {
  subtitle?: string;
}

export default function SiteHeader({ subtitle }: SiteHeaderProps) {
  const { user: authUser, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Formula Search" },
    { href: "/color-library", label: "Color Visual Library" },
    { href: "/application-guide", label: "Application Guide" },
    { href: "/admin/formulas", label: "Formula Data Management" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#bdc9c8] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-10">
        {/* 左侧 Logo */}
        <a href="/" className="flex items-center gap-3">
          <img
            src="/haiwen.png"
            alt="HAIWEN"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <span className="text-lg font-bold text-[#006565] sm:text-xl">
            HAIWEN MIX{subtitle ? ` ${subtitle}` : ""}
          </span>
        </a>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-[#3e4949] transition-colors hover:text-[#006565]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[#3e4949] sm:inline">
                {authUser.username}
              </span>
              {authUser.role === "admin" && (
                <a
                  href="/admin/users"
                  className="rounded-lg bg-[#006565] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  用户管理
                </a>
              )}
              <button
                onClick={logout}
                className="rounded-lg bg-[#006565] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                退出
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-[#006565] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Login
            </a>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
