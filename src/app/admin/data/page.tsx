"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";
import BrandsPanel from "./components/BrandsPanel";
import ColorsPanel from "./components/ColorsPanel";
import VariantsPanel from "./components/VariantsPanel";
import FormulasPanel from "./components/FormulasPanel";
import GuidesPanel from "./components/GuidesPanel";
import SettingsPanel from "./components/SettingsPanel";

const TABS = [
  { key: "brands", label: "品牌" },
  { key: "colors", label: "颜色" },
  { key: "variants", label: "变体" },
  { key: "formulas", label: "配方" },
  { key: "guides", label: "指南" },
  { key: "settings", label: "设置" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DataManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("brands");

  // 权限检查：非 admin 跳转登录页
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="p-8 text-center text-xs text-gray-500">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SiteHeader />
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <h2 className="mb-4 text-base font-semibold text-gray-900">数据管理</h2>

        <div className="mb-6 flex gap-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-[#0D9488] text-[#0D9488]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-2">
          {activeTab === "brands" && <BrandsPanel />}
          {activeTab === "colors" && <ColorsPanel />}
          {activeTab === "variants" && <VariantsPanel />}
          {activeTab === "formulas" && <FormulasPanel />}
          {activeTab === "guides" && <GuidesPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}
