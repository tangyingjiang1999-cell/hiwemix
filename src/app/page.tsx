"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

  // === 玻璃拟态状态管理 ===
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const glassRef = useRef<HTMLDivElement>(null);
  const transitionDurationRef = useRef("1.5s");

  const applyTransitionDuration = useCallback((dur: string) => {
    transitionDurationRef.current = dur;
    const gl = glassRef.current;
    if (gl) gl.style.transitionDuration = dur;
  }, []);

  const shouldBeBlurred = isFocused || isHovered;

  function handleGlassEnter() {
    if (isFocused) return;
    applyTransitionDuration("1.5s");
    setIsHovered(true);
  }
  function handleGlassLeave() {
    if (isFocused) return;
    applyTransitionDuration("1.5s");
    setIsHovered(false);
  }
  function handleGlassFocus() {
    applyTransitionDuration("0.2s");
    setIsFocused(true);
  }
  function handleGlassBlur() {
    setIsFocused(false);
    if (!isHovered) {
      applyTransitionDuration("1.5s");
    }
  }

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.bgState = shouldBeBlurred ? "white" : "default";
    return () => { delete document.body.dataset.bgState; };
  }, [shouldBeBlurred]);

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
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* 背景图片层 */}
      <div
        className="absolute inset-0 overflow-hidden z-0 hidden sm:block transition-opacity duration-[1.5s] ease-in-out"
        style={{ opacity: shouldBeBlurred ? 0 : 1 }}
      >
        <img
          src="/bg-home.jpg"
          alt=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto max-w-none block"
        />
      </div>

      {/* 页面内容 */}
      <div className="relative z-10 flex flex-col flex-1">
        <SiteHeader />
        <section className="flex-1 flex flex-col pt-20 md:pt-24">
          <div className="mx-4 sm:mx-8 md:mx-[60px]">
            <div
              className="mb-6 md:mb-8 mt-2 md:mt-3"
              onMouseEnter={handleGlassEnter}
              onMouseLeave={handleGlassLeave}
            />

            {/* 玻璃拟态搜索框容器 */}
            <div
              ref={glassRef}
              onMouseEnter={handleGlassEnter}
              onMouseLeave={handleGlassLeave}
              className="w-full max-w-[95vw] rounded-[15px] border border-white/40 py-6 md:py-8 px-5 md:px-8 transition-all duration-[1.5s] ease-in-out"
              style={{
                backgroundColor: shouldBeBlurred ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)",
                backdropFilter: shouldBeBlurred ? "blur(16px)" : "blur(8px)",
                WebkitBackdropFilter: shouldBeBlurred ? "blur(16px)" : "blur(8px)",
                boxShadow: shouldBeBlurred ? "none" : "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              {/* 标题 */}
              <div className="mb-5 md:mb-7 w-full text-center">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-tight font-extrabold text-primary tracking-tight font-heading">
                  <SplitText
                    text={`${t.heroTitlePrefix} ${t.heroTitleHighlight}`}
                    tag="span"
                    stagger={0.03}
                    duration={0.4}
                    from={{ opacity: 0, y: 20 }}
                    to={{ opacity: 1, y: 0 }}
                  />
                </h1>
              </div>
              <SearchPanel
                onSearch={handleSearch}
                isLoading={isLoading}
                onFocusCapture={handleGlassFocus}
                onBlurCapture={handleGlassBlur}
              />
            </div>
          </div>
          {hasSearched && (
            <div className="mx-4 sm:mx-8 md:mx-[60px] mt-4 md:mt-5">
              <SearchResults rows={tableRows} isLoading={isLoading} hasSearched={hasSearched} onOpenFormula={handleOpenFormula} />
            </div>
          )}
        </section>
        <Footer isLightBackground={shouldBeBlurred} />
        <FormulaDrawer result={drawerResult} formulaId={drawerFormulaId} initialYear={drawerYear} onClose={() => setDrawerResult(null)} />
      </div>
    </div>
  );
}
