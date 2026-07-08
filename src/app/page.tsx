"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
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
      <footer className="bg-[#2d3133] text-[#bdc9c8]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-8 md:flex-row md:justify-between md:gap-12 lg:px-10">
          {/* 品牌 Logo + 社交图标 */}
          <div className="flex items-center gap-6">
            <Image
              src="/haiwen-logo.png"
              alt="HAIWEN MIX"
              width={120}
              height={32}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            {/* 社交媒体链接 */}
            <div className="flex items-center gap-4">
              {/* Website */}
              <a
                href="https://www.hiwe.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="text-[#bdc9c8] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send?phone=8615819205996"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-[#bdc9c8] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61550592422623"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#bdc9c8] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#bdc9c8] transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <li><Link href="/" className="transition-colors hover:text-white">{t.navFormulaSearch}</Link></li>
              <li><Link href="/color-library" className="transition-colors hover:text-white">{t.navColorLibrary}</Link></li>
              <li><Link href="/application-guide" className="transition-colors hover:text-white">{t.navAppGuide}</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      <FormulaDrawer result={drawerResult} onClose={handleCloseDrawer} />
    </div>
  );
}