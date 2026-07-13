"use client";

import { useState, useEffect, useRef } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, Color, Formula, SearchParams, SearchResult, FormulaTableRow } from "@/types";

export default function Home() {
  const { t } = useLang();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [tableRows, setTableRows] = useState<FormulaTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);
  const [drawerInitialIdx, setDrawerInitialIdx] = useState(0);

  // colors + formulas + brands 只加载一次，后续搜索复用缓存
  const dataPromiseRef = useRef<Promise<{ colors: Color[]; formulas: Formula[]; brands: CarMake[] }> | null>(null);

  function loadData() {
    if (!dataPromiseRef.current) {
      dataPromiseRef.current = Promise.all([
        fetch("/api/colors").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/formulas").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/brands").then((r) => (r.ok ? r.json() : [])),
      ]).then(([c, f, b]) => ({
        colors: c as Color[],
        formulas: f as Formula[],
        brands: b as CarMake[],
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
      .then(({ colors, formulas, brands }) => {
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

        // 展平为每配方一行，解析厂商名与年份
        const brandsMap = new Map(brands.map((b) => [b.id, b.name]));
        const rows: FormulaTableRow[] = [];
        for (const result of results) {
          for (const formula of result.formulas) {
            rows.push({
              color: result.color,
              formula,
              variant: result.color.variants.find((v) => v.id === formula.variant_id),
              makeName: brandsMap.get(result.color.make_id) ?? result.color.make_id,
            });
          }
        }

        setSearchResults(results);
        setTableRows(rows);
      })
      .catch((err) => {
        console.error(err);
        setSearchResults([]);
      })
      .finally(() => setIsLoading(false));
  }

  function handleOpenFormula(row: FormulaTableRow) {
    const result = searchResults.find((r) => r.color.id === row.color.id);
    if (!result) return;
    const idx = result.formulas.findIndex((f) => f.id === row.formula.id);
    setDrawerResult(result);
    setDrawerInitialIdx(idx >= 0 ? idx : 0);
  }

  function handleCloseDrawer() {
    setDrawerResult(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <SiteHeader />

      {/* Hero + Search */}
      <section className="relative flex min-h-[50vh] flex-1 items-center overflow-hidden pt-20 pb-8 md:pt-24">

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-10">
          <div className="mx-auto w-full space-y-6 text-center">
            <h1 className="text-balance text-2xl font-semibold leading-snug text-[#171717] sm:text-3xl sm:font-bold md:text-4xl lg:text-5xl">
              {t.heroTitlePrefix} <span className="text-[#0D9488]">{t.heroTitleHighlight}</span>
            </h1>

            <div className="rounded-lg border border-[#EBEBEB] bg-white p-4 sm:p-6" style={{boxShadow:"0 1px 1px rgba(0,0,0,0.02), 0 2px 2px rgba(0,0,0,0.04)"}}>
              <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Search results inline below search box */}
            {hasSearched && (
              <div className="mt-4 rounded-lg border border-[#EBEBEB] bg-white p-4 text-left sm:p-6" style={{boxShadow:"0 1px 1px rgba(0,0,0,0.02), 0 2px 2px rgba(0,0,0,0.04)"}}>
                <SearchResults
                  rows={tableRows}
                  isLoading={isLoading}
                  hasSearched={hasSearched}
                  onOpenFormula={handleOpenFormula}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <FormulaDrawer result={drawerResult} initialFormulaIdx={drawerInitialIdx} onClose={handleCloseDrawer} />
    </div>
  );
}