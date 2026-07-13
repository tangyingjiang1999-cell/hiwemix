"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/AuthContext";
import { useLang } from "@/components/LanguageContext";

interface SiteHeaderProps {}

export default function SiteHeader({}: SiteHeaderProps) {
  const { user: authUser, logout } = useAuth();
  const { t } = useLang();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 顶部导航链接，与 Logo 同行水平对齐
  const navItems: { label: string; href: string }[] = [
    { label: t.navFormulaSearch, href: "/" },
    { label: t.navColorLibrary, href: "/color-library" },
    { label: t.navAppGuide, href: "/application-guide" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#EBEBEB] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-10 lg:px-20">
        {/* Logo - 左侧 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/HIWE_Logo.png"
            alt="HIWE MIX"
            width={1893}
            height={334}
            className="h-7 w-auto object-contain sm:h-8 md:h-9"
          />
        </Link>

        {/* 中间导航链接 - 桌面端 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive =
              (item.href === "/" && pathname === "/") ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#0D9488] font-semibold"
                    : "text-[#6B7280] hover:text-[#0D9488]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {authUser ? (
            <div className="flex items-center gap-2">
              {authUser.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="max-w-20 truncate rounded-lg bg-[#0D9488] px-2 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 md:max-w-none md:px-4 md:text-sm"
                >
                  {authUser.username}
                </Link>
              )}
              <button
                onClick={logout}
                className="rounded-lg bg-[#0D9488] px-2 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 md:px-4 md:text-sm"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#0D9488] px-2 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 md:px-4 md:text-sm"
            >
              {t.login}
            </Link>
          )}
          <LanguageSwitcher />

          {/* 移动端汉堡菜单按钮 */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#0D9488] hover:bg-[#0D9488]/5 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      {mobileMenuOpen && (
        <nav className="absolute left-0 right-0 top-full border-b border-[#bdc9c8] bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive =
                (item.href === "/" && pathname === "/") ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#0D9488]/10 text-[#0D9488] font-semibold"
                      : "text-[#6B7280] hover:bg-gray-50 hover:text-[#0D9488]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
