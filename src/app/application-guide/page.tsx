"use client";

import { useState, useMemo } from "react";
import { guideCategories, guideItems } from "@/lib/guide-data";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import type { GuideItem } from "@/lib/guide-data";

function GuideContent({ guide }: { guide: GuideItem }) {
  const { lang } = useLang();

  const content = lang === "zh" ? guide.contentZh : guide.content;
  const lines = content.split("\n");

  return (
    <div className="prose max-w-none">
      <h1 className="mb-4 text-sm font-semibold font-bold">
        {lang === "zh" ? guide.titleZh : guide.title}
      </h1>

      <div className="space-y-4">
        {lines.map((line, index) => {
          if (line.endsWith(":") && !line.startsWith(" ")) {
            return (
              <h3 key={index} className="mt-6 mb-2 text-xs font-semibold">
                {line}
              </h3>
            );
          }

          if (line.match(/^\d+\./)) {
            return (
              <div key={index} className="ml-4 text-xs">
                {line}
              </div>
            );
          }

          if (line.trim() === "") {
            return <br key={index} />;
          }

          return (
            <p key={index} className="text-xs leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function ApplicationGuidePage() {
  const { t, lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = useMemo(() => {
    let guides = guideItems;

    if (selectedCategory) {
      guides = guides.filter((g) => g.category === selectedCategory);
    }

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
      <SiteHeader />
      <Navigation />

      <div className="bg-white px-6 pt-20 pb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.guideSearchPlaceholder}
          className="w-full rounded-lg border px-4 py-2 text-xs"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-64 border-r border-b lg:border-b-0 bg-white p-4">
          <h3 className="mb-3 text-[11px] text-gray-500 font-semibold text-gray-600">
            {t.guideCategories}
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full rounded px-3 py-2 text-left text-xs ${
                  selectedCategory === "" ? "bg-teal-50 text-teal-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.guideAllCategories}
              </button>
            </li>
            {guideCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full rounded px-3 py-2 text-left text-xs ${
                    selectedCategory === cat.id ? "bg-teal-50 text-teal-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {lang === "zh" ? cat.nameZh : cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-80 border-r border-b lg:border-b-0 bg-gray-50 p-4">
          <h3 className="mb-3 text-[11px] text-gray-500 font-semibold text-gray-600">
            {t.guideListLabel} ({filteredGuides.length})
          </h3>
          <ul className="space-y-2">
            {filteredGuides.map((guide) => (
              <li
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className={`cursor-pointer rounded border p-3 transition-all ${
                  selectedGuide?.id === guide.id
                    ? "border-teal-600 bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-teal-600"
                }`}
              >
                <p className="text-xs font-semibold">{lang === "zh" ? guide.titleZh : guide.title}</p>
                <p className="mt-1 text-[11px] text-gray-500 text-gray-500">
                  {guideCategories.find((c) => c.id === guide.category)?.[lang === "zh" ? "nameZh" : "name"] || guide.category}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 p-4 md:p-6">
          {selectedGuide ? (
            <GuideContent guide={selectedGuide} />
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              <p className="text-xs">{t.guideSelectHint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
