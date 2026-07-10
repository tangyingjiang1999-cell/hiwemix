"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { TONERS, TONER_CATEGORIES } from "@/data/toners";
import type { TonerCategory } from "@/types";

function TonerCard({ code, tradeName, nameZh, hex }: { code: string; tradeName: string; nameZh: string; hex: string }) {
  return (
    <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white transition-all hover:border-teal-500 hover:shadow-md">
      {/* 颜色色块 */}
      <div
        className="h-20 rounded-t-lg"
        style={{ backgroundColor: hex }}
      />

      {/* 信息区 */}
      <div className="space-y-0.5 p-3">
        <p className="font-mono text-[11px] font-semibold text-gray-800">{code}</p>
        <p className="text-xs font-medium text-gray-900 truncate">{tradeName}</p>
        <p className="text-[11px] text-gray-500">{nameZh}</p>
      </div>
    </div>
  );
}

export default function TonerPage() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState<TonerCategory>("2K_BASECOAT");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredToners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TONERS.filter((toner) => {
      if (toner.category !== activeCategory) return false;
      if (!q) return true;
      return (
        toner.code.toLowerCase().includes(q) ||
        toner.tradeName.toLowerCase().includes(q) ||
        toner.nameZh.includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <Navigation />

      {/* 标题栏 */}
      <div className="bg-white border-b border-gray-200 px-4 pt-20 pb-0 lg:px-6">
        <h1 className="text-lg font-bold text-gray-900">Toner</h1>
      </div>

      {/* 分类按钮 + 搜索 */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* 分类按钮 */}
          <div className="flex flex-wrap gap-2">
            {TONER_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                  activeCategory === cat.key
                    ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:text-teal-700"
                }`}
              >
                {cat.label}
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeCategory === cat.key
                    ? "bg-teal-500/30 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or name..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 色母卡片网格 */}
      <div className="flex-1 px-4 py-5 lg:px-6">
        {filteredToners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">No toners found</p>
            <p className="mt-1 text-xs">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredToners.map((toner) => (
              <TonerCard
                key={toner.code}
                code={toner.code}
                tradeName={toner.tradeName}
                nameZh={toner.nameZh}
                hex={toner.hex}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
