"use client";

import { useState, useEffect, useRef } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLang } from "@/components/LanguageContext";
import type { Color, Formula, SearchParams, SearchResult } from "@/types";

export default function Home() {
  const { t } = useLang();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);

  // colors + formulas 只加载一次，后续搜索复用缓存（避免每次搜索都请求 API）
  const dataPromiseRef = useRef<Promise<{ colors: Color[]; formulas: Formula[] }> | null>(null);

  function loadData() {
    if (!dataPromiseRef.current) {
      dataPromiseRef.current = Promise.all([
        fetch("/api/colors").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/formulas").then((r) => (r.ok ? r.json() : [])),
      ]).then(([c, f]) => ({
        colors: c as Color[],
        formulas: f as Formula[],
      }));
    }
    return dataPromiseRef.current;
  }

  // 页面打开即预加载，用户点搜索时数据通常已就绪
  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  // 按已加载的数据做客户端过滤，不再每次请求 API
  function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setHasSearched(true);
    loadData()
      .then(({ colors, formulas }) => {
        let filtered = colors;
        if (params.make_id) filtered = filtered.filter((c) => c.make_id === params.make_id);
        if (params.color_code) {
          const code = params.color_code!.toUpperCase();
          filtered = filtered.filter((c) => c.color_code.toUpperCase().includes(code));
        }
        if (params.color_name) {
          const name = params.color_name!.toLowerCase();
          filtered = filtered.filter((c) => c.color_name.toLowerCase().includes(name));
        }
        if (params.color_type) filtered = filtered.filter((c) => c.color_type === params.color_type);
        if (params.year) {
          filtered = filtered.filter((c) => c.variants.some((v) => v.year_range.includes(params.year!)));
        }

        const results: SearchResult[] = filtered.map((color) => ({
          color,
          formulas: formulas.filter((f) => f.color_id === color.id),
        }));
        setSearchResults(results);
      })
      .catch((err) => {
        console.error(err);
        setSearchResults([]);
      })
      .finally(() => setIsLoading(false));
  }

  function handleOpenDetail(result: SearchResult) {
    setDrawerResult(result);
  }

  function handleCloseDrawer() {
    setDrawerResult(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7fafc]">
      <SiteHeader />

      {/* Hero + Search */}
      <section className="relative flex min-h-[50vh] flex-1 items-center overflow-hidden pt-20 pb-8 md:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7fafc] via-[#f7fafc] to-[#0D9488]/5" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-10">
          <div className="mx-auto w-full space-y-6 text-center">
            <h1 className="text-3xl font-bold leading-tight text-[#181c1e] sm:text-4xl lg:text-5xl">
              {t.heroTitlePrefix} <span className="text-[#0D9488]">{t.heroTitleHighlight}</span>
            </h1>

            <div className="rounded-xl border border-[#bdc9c8]/50 bg-white p-4 shadow-sm sm:p-6">
              <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Search results inline below search box */}
            {hasSearched && (
              <div className="mt-4 rounded-xl border border-[#bdc9c8]/50 bg-white p-4 text-left shadow-sm sm:p-6">
                <SearchResults
                  results={searchResults}
                  isLoading={isLoading}
                  hasSearched={hasSearched}
                  onOpenDetail={handleOpenDetail}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <FormulaDrawer result={drawerResult} onClose={handleCloseDrawer} />
    </div>
  );
}