"use client";

import { useState, useEffect, useRef } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import SplitText from "@/components/SplitText";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, Color, Formula, SearchParams, SearchResult, FormulaTableRow } from "@/types";

export default function Home() {
  const { t } = useLang();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [tableRows, setTableRows] = useState<FormulaTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);
  const [drawerFormulaId, setDrawerFormulaId] = useState<string | undefined>();
  const [drawerYear, setDrawerYear] = useState<number | undefined>();

  const dataPromiseRef = useRef<Promise<{ colors: Color[]; formulas: Formula[]; brands: CarMake[] }> | null>(null);

  function loadData() {
    if (!dataPromiseRef.current) {
      dataPromiseRef.current = Promise.all([
        fetch("/api/colors").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/formulas").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/brands").then((r) => (r.ok ? r.json() : [])),
      ]).then(([c, f, b]) => ({ colors: c as Color[], formulas: f as Formula[], brands: b as CarMake[] }));
    }
    return dataPromiseRef.current;
  }

  useEffect(() => { loadData().catch(() => {}); }, []);

  function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setHasSearched(true);
    loadData().then(({ colors, formulas, brands }) => {
      let filtered = colors;

      if (params.region) {
        const regionBrandIds = brands
          .filter((b) => b.region === params.region)
          .map((b) => b.id);
        filtered = filtered.filter((c) => regionBrandIds.includes(c.make_id));
      }

      if (params.make_id) filtered = filtered.filter((c) => c.make_id === params.make_id);

      if (params.color_code) {
        const code = params.color_code!.toUpperCase();
        filtered = filtered.filter((c) => c.color_code.toUpperCase().includes(code));
      }

      if (params.color_name) {
        const name = params.color_name!.toLowerCase();
        filtered = filtered.filter((c) => c.color_name.toLowerCase().includes(name));
      }

      if (params.color_type) filtered = filtered.filter((c) => c.color_type.toLowerCase() === params.color_type);

      if (params.year) {
        const searchYear = parseInt(params.year, 10);
        if (!isNaN(searchYear)) {
          filtered = filtered.filter((c) =>
            c.years && c.years.some((y) => y === searchYear)
          );
        }
      }
      const results: SearchResult[] = filtered.map((color) => ({
        color,
        formulas: formulas.filter((f) => f.color_id === color.id),
      }));
      const brandsMap = new Map(brands.map((b) => [b.id, b.name]));
      const searchYear = params.year ? parseInt(params.year, 10) : undefined;
      const rows: FormulaTableRow[] = [];
      for (const r of results) {
        const colorYears = searchYear && !isNaN(searchYear)
          ? [searchYear]
          : r.color.years && r.color.years.length > 0 ? r.color.years : [undefined];
        for (const f of r.formulas) {
          for (const year of colorYears) {
            rows.push({
              color: r.color,
              formula: f,
              variant: r.color.variants.find((v) => v.id === f.variant_id),
              makeName: brandsMap.get(r.color.make_id) ?? r.color.make_id,
              year,
            });
          }
        }
      }
      setSearchResults(results);
      setTableRows(rows);
    }).catch((err) => { console.error(err); setSearchResults([]); }).finally(() => setIsLoading(false));
  }

  function handleOpenFormula(row: FormulaTableRow) {
    const r = searchResults.find((x) => x.color.id === row.color.id);
    if (!r) return;
    setDrawerResult(r);
    setDrawerFormulaId(row.formula.id);
    setDrawerYear(row.year);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4f5f7] overflow-x-clip">
      <SiteHeader />

      {/* ===== Hero 英雄横幅 ===== */}
      <section className="relative isolate">
        {/* 背景图片层 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/bg-home.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          {/* 工业感深色渐变蒙版：保证标题与卡片区域对比度 */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,22,34,0.78)_0%,rgba(11,22,34,0.45)_38%,rgba(11,22,34,0.35)_60%,rgba(244,245,247,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,22,34,0.55)_0%,transparent_55%)]" />
        </div>

        <div className="mx-auto w-full max-w-[1240px] px-4 pt-28 sm:px-8 md:pt-32 md:px-12">
          {/* 标题区 */}
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#4aa3e0]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                {t.heroEyebrow ?? "Professional Refinish System"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white text-balance sm:text-4xl md:text-5xl lg:text-[56px]">
              <SplitText
                text={`${t.heroTitlePrefix} ${t.heroTitleHighlight}`}
                tag="span"
                stagger={0.03}
                duration={0.4}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
              />
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {t.heroSubtitle ?? "精准查询汽车修补漆配方 — 按品牌、色号、颜色类型与年份快速定位。"}
            </p>
          </div>

          {/* ===== 实心搜索卡片 ===== */}
          <div className="relative mt-8 md:mt-10">
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_20px_60px_-15px_rgba(11,22,34,0.35)]">
              {/* 顶部品牌色装饰条 */}
              <div className="h-1 w-full bg-[#2487ca]" />
              <div className="px-5 py-6 sm:px-8 sm:py-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-4 w-1 rounded-full bg-[#2487ca]" />
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#171717]">
                    {t.searchPanelTitle ?? t.search}
                  </h2>
                </div>
                <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 结果区 ===== */}
      <section className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-16 pt-8 sm:px-8 md:px-12">
        {hasSearched && (
          <SearchResults rows={tableRows} isLoading={isLoading} hasSearched={hasSearched} onOpenFormula={handleOpenFormula} />
        )}
      </section>

      <Footer isLightBackground={true} />
      <FormulaDrawer result={drawerResult} formulaId={drawerFormulaId} initialYear={drawerYear} onClose={() => setDrawerResult(null)} />
    </div>
  );
}
