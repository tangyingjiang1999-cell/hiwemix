"use client";

import { useState, useMemo } from "react";
import { guideCategories, guideItems } from "@/lib/guide-data";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import type { GuideItem } from "@/lib/guide-data";

// 指南内容组件
function GuideContent({ guide }: { guide: GuideItem }) {
  const { t, lang } = useLang();

  const content = lang === "zh" ? guide.contentZh : guide.content;
  const lines = content.split("\n");

  return (
    <div className="prose max-w-none">
      <h1 className="mb-4 text-2xl font-bold">
        {lang === "zh" ? guide.titleZh : guide.title}
      </h1>

      <div className="space-y-4">
        {lines.map((line, index) => {
          // 标题行
          if (line.endsWith(":") && !line.startsWith(" ")) {
            return (
              <h3 key={index} className="mt-6 mb-2 font-semibold text-lg">
                {line}
              </h3>
            );
          }

          // 列表项
          if (line.match(/^\d+\./)) {
            return (
              <div key={index} className="ml-4">
                {line}
              </div>
            );
          }

          // 空行
          if (line.trim() === "") {
            return <br key={index} />;
          }

          // 普通段落
          return (
            <p key={index} className="leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// 主页面
export default function ApplicationGuidePage() {
  const { t, lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 筛选指南
  const filteredGuides = useMemo(() => {
    let guides = guideItems;

    // 按分类筛选
    if (selectedCategory) {
      guides = guides.filter((g) => g.category === selectedCategory);
    }

    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      guides = guides.filter((g) => {
        const title = lang === "zh" ? g.titleZh : g.title;
        const content = lang === "zh" ? g.contentZh : g.content;
        return title.toLowerCase().includes(query) || content.toLowerCase().includes(query);
      });
    }

    return guides;
  }, [selectedCategory, searchQuery, lang]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部 */}
      <SiteHeader subtitle="Application Guide" />
      <Navigation />

      {/* 搜索栏 */}
      <div className="bg-white px-6 py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "zh" ? "搜索指南..." : "Search guides..."}
          className="w-full rounded-lg border px-4 py-2 text-sm"
        />
      </div>

      {/* 主体内容 */}
      <div className="flex">
        {/* 左侧分类栏 */}
        <div className="w-64 border-r bg-white p-4">
          <h3 className="mb-3 font-semibold text-sm text-gray-600">
            {lang === "zh" ? "分类" : "Categories"}
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full rounded px-3 py-2 text-left text-sm ${
                  selectedCategory === "" ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {lang === "zh" ? "全部分类" : "All Categories"}
              </button>
            </li>
            {guideCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    selectedCategory === cat.id ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {lang === "zh" ? cat.nameZh : cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 中间指南列表 */}
        <div className="w-80 border-r bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-sm text-gray-600">
            {lang === "zh" ? "指南列表" : "Guide List"} ({filteredGuides.length})
          </h3>
          <ul className="space-y-2">
            {filteredGuides.map((guide) => (
              <li
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className={`cursor-pointer rounded border p-3 text-sm transition-all ${
                  selectedGuide?.id === guide.id
                    ? "border-teal-600 bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-teal-600"
                }`}
              >
                <p className="font-medium">{lang === "zh" ? guide.titleZh : guide.title}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {guideCategories.find((c) => c.id === guide.category)?.[lang === "zh" ? "nameZh" : "name"] || guide.category}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧指南内容 */}
        <div className="flex-1 p-6">
          {selectedGuide ? (
            <GuideContent guide={selectedGuide} />
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              <p>{lang === "zh" ? "请从左侧选择指南" : "Please select a guide from the left"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
