"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/components/AuthContext";
import BrandsPanel from "./components/BrandsPanel";
import ColorsPanel from "./components/ColorsPanel";
import VariantsPanel from "./components/VariantsPanel";
import FormulasPanel from "./components/FormulasPanel";
import GuidesPanel from "./components/GuidesPanel";
import SettingsPanel from "./components/SettingsPanel";

const TABS = [
  {
    key: "brands",
    label: "品牌",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-4 4 4 6-6 4 4" />
        <path d="M3 21h18" />
        <circle cx="7" cy="9" r="2" />
      </svg>
    ),
  },
  {
    key: "colors",
    label: "颜色",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 010 18z" fill="currentColor" />
        <circle cx="8" cy="9" r="1.2" fill="currentColor" />
        <circle cx="15" cy="14" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "variants",
    label: "变体",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "formulas",
    label: "配方",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 3v6L4 19a2 2 0 001.7 3h12.6A2 2 0 0020 19l-6-10V3" />
        <path d="M7 14h10" />
      </svg>
    ),
  },
  {
    key: "guides",
    label: "指南",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" />
        <path d="M4 4v13a3 3 0 003 3" />
        <path d="M9 8h6M9 12h6" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "设置",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </svg>
    ),
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DataManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("brands");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 权限检查：非 admin 跳转登录页
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 切换 tab 时关闭移动端抽屉
  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  if (loading || !user || user.role !== "admin") {
    return <div className="p-8 text-center text-sm text-gray-500">加载中...</div>;
  }

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SiteHeader />

      {/* 移动端汉堡按钮 */}
      <button
        onClick={() => setMobileNavOpen((v) => !v)}
        className="fixed left-4 top-20 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#EBEBEB] bg-white text-gray-600 shadow-sm md:hidden"
        aria-label="切换导航"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex pt-16">
        {/* 左侧导航（桌面固定，移动端抽屉） */}
        <aside
          className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-[#EBEBEB] bg-[#FAFAFA] transition-transform md:sticky md:top-16 md:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col px-3 py-4">
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-[#888888]">
              Data Management
            </p>
            <nav className="flex-1 space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#E0F2FE] to-white text-[#0369A1] shadow-[inset_2px_0_0_#0EA5E9]"
                        : "text-[#4D4D4D] hover:bg-gradient-to-r hover:from-[#E0F2FE]/70 hover:to-[#E0F2FE]/0 hover:text-[#0369A1]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-[#0EA5E9]" />
                    )}
                    <span className={isActive ? "text-[#0EA5E9]" : "text-[#888888] group-hover:text-[#0EA5E9]"}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 移动端抽屉遮罩 */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* 右侧主区 */}
        <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-x-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
            {/* 面包屑 */}
            <div className="mb-5 flex items-center gap-1.5 text-sm text-[#888888]">
              <span>Data Management</span>
              <span>/</span>
              <span className="font-medium text-[#171717]">{activeLabel}</span>
            </div>

            <div>
              {activeTab === "brands" && <BrandsPanel />}
              {activeTab === "colors" && <ColorsPanel />}
              {activeTab === "variants" && <VariantsPanel />}
              {activeTab === "formulas" && <FormulasPanel />}
              {activeTab === "guides" && <GuidesPanel />}
              {activeTab === "settings" && <SettingsPanel />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
