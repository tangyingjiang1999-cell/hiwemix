"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/AuthContext";
import { useLang } from "@/components/LanguageContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export default function SiteHeader() {
  const { user: authUser, logout } = useAuth();
  const { t } = useLang();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const prevPathRef = useRef<string | null>(null);

  const isHome = pathname === "/";
  const prevIsHome = prevPathRef.current === "/";

  const isCrossHomeNav =
    prevPathRef.current !== null && prevIsHome !== isHome;

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  const transitionStyle = isCrossHomeNav
    ? "all 1.5s ease-in-out"
    : "none";

  // 首页头部叠在深色英雄蒙版上，统一使用白字以保证可读性
  const headerBg = isHome ? "transparent" : "#2487ca";
  const headerPos = isHome ? "absolute" : "fixed";
  const headerTextColor = "#ffffff";
  const headerMutedColor = "rgba(255,255,255,0.72)";
  const headerBorderColor = "rgba(255,255,255,0.3)";
  const headerHoverBg = "rgba(255,255,255,0.1)";

  const navItems: { label: string; href: string }[] = [
    { label: t.navFormulaSearch, href: "/" },
    { label: t.navColorLibrary, href: "/color-library" },
    { label: t.navAppGuide, href: "/application-guide" },
  ];

  const isActive = (href: string) =>
    (href === "/" && pathname === "/") ||
    (href !== "/" && pathname?.startsWith(href));

  return (
    <>
      <header
        className="top-0 left-0 z-[1100] w-full border-b transition-all duration-[1.5s] ease-in-out"
        style={{
          position: headerPos,
          backgroundColor: headerBg,
          borderBottomColor: isHome ? "transparent" : "rgba(255,255,255,0.15)",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
      >
        <div
          className="mx-auto flex h-16 items-center px-6 sm:px-8 md:px-[60px]"
          style={{ position: "relative" }}
        >
          {/* Logo 左侧 */}
          <Link href="/" className="flex shrink-0 z-[1]">
            <img
              src="/hiwemix2-01.png"
              alt="HIWE MIX"
              className="h-5 w-auto object-contain block md:h-8 transition-all duration-[1.5s] ease-in-out"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          {/* 中间导航链接 — 绝对定位水平居中 */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="text-[13px] font-semibold transition-colors whitespace-nowrap"
                    style={{
                      color: active ? headerTextColor : headerMutedColor,
                      fontWeight: active ? 700 : 600,
                      transition: transitionStyle,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = headerTextColor;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLAnchorElement).style.color = headerMutedColor;
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右侧 spacer + actions */}
          <div className="flex-1" />
          <div className="flex items-center gap-3 shrink-0 z-[1]">
            {authUser ? (
              <>
                {authUser.role === "admin" && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      href="/admin/data"
                      className="inline-flex h-9 items-center rounded-lg border px-3 text-[13px] font-semibold transition-all duration-[1.5s] ease-in-out"
                      style={{
                        borderColor: headerBorderColor,
                        color: headerMutedColor,
                        transition: transitionStyle,
                      }}
                      onMouseEnter={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = headerTextColor;
                        t.style.color = headerTextColor;
                        t.style.backgroundColor = headerHoverBg;
                      }}
                      onMouseLeave={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = headerBorderColor;
                        t.style.color = headerMutedColor;
                        t.style.backgroundColor = "transparent";
                      }}
                    >
                      {t.navAdmin}
                    </Link>
                    <Link
                      href="/admin/users"
                      className="inline-flex h-9 items-center rounded-lg border px-3 text-[13px] font-semibold transition-all duration-[1.5s] ease-in-out"
                      style={{
                        borderColor: headerBorderColor,
                        color: headerMutedColor,
                        transition: transitionStyle,
                      }}
                      onMouseEnter={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = headerTextColor;
                        t.style.color = headerTextColor;
                        t.style.backgroundColor = headerHoverBg;
                      }}
                      onMouseLeave={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = headerBorderColor;
                        t.style.color = headerMutedColor;
                        t.style.backgroundColor = "transparent";
                      }}
                    >
                      {authUser.username}
                    </Link>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="hidden md:inline-flex h-9 items-center rounded-lg border px-3 text-[13px] font-semibold transition-all duration-[1.5s] ease-in-out"
                  style={{
                    borderColor: headerBorderColor,
                    color: headerMutedColor,
                    transition: transitionStyle,
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget as HTMLButtonElement;
                    t.style.borderColor = headerTextColor;
                    t.style.color = headerTextColor;
                    t.style.backgroundColor = headerHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget as HTMLButtonElement;
                    t.style.borderColor = headerBorderColor;
                    t.style.color = headerMutedColor;
                    t.style.backgroundColor = "transparent";
                  }}
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-lg bg-[#2487ca] px-3 text-[13px] font-semibold text-white transition-all duration-[1.5s] ease-in-out"
                style={{ transition: transitionStyle }}
              >
                {t.login}
              </Link>
            )}

            <LanguageSwitcher isHome={isHome} transitionStyle={transitionStyle} />

            {/* 移动端汉堡按钮 */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="inline-flex size-9 items-center justify-center rounded-lg md:hidden"
              style={{ color: headerTextColor, transition: transitionStyle }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 移动端导航 Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[min(80vw,320px)] p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <img
              src="/hiwemix2-01.png"
              alt="HIWE MIX"
              className="h-6 w-auto object-contain block"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-lg"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="pt-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block mx-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-primary font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {authUser?.role === "admin" && (
            <>
              <Separator className="my-1" />
              <Link
                href="/admin/data"
                onClick={() => setMobileMenuOpen(false)}
                className="block mx-3 px-3 py-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t.navAdmin}
              </Link>
              <Link
                href="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block mx-3 px-3 py-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {authUser.username}
              </Link>
              <Separator className="my-1" />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
