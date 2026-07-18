"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, Color, Formula, SearchParams, SearchResult, FormulaTableRow } from "@/types";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Home() {
  const { t } = useLang();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [tableRows, setTableRows] = useState<FormulaTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);
  const [drawerInitialIdx, setDrawerInitialIdx] = useState(0);
  const [drawerFormulaId, setDrawerFormulaId] = useState<string | undefined>();
  const [drawerYear, setDrawerYear] = useState<number | undefined>();

  // === 玻璃拟态状态管理 ===
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const blurLayerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const transitionDurationRef = useRef("1.5s");

  const applyTransitionDuration = useCallback((dur: string) => {
    transitionDurationRef.current = dur;
    const el = blurLayerRef.current;
    if (el) el.style.transitionDuration = dur;
    const gl = glassRef.current;
    if (gl) gl.style.transitionDuration = dur;
  }, []);

  // 是否需要模糊（聚焦状态锁死：即使鼠标离开也保持模糊）
  const shouldBeBlurred = isFocused || isHovered;

  function handleGlassEnter() {
    if (isFocused) return; // 聚焦时忽略 hover
    applyTransitionDuration("1.5s");
    setIsHovered(true);
  }
  function handleGlassLeave() {
    if (isFocused) return; // 聚焦时锁死，不恢复
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
      // 鼠标不在组件上，慢速淡出
      applyTransitionDuration("1.5s");
    }
    // 若鼠标仍在组件上，handleGlassEnter 已设置 isHovered，保持模糊
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

  function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setHasSearched(true);
    loadData().then(({ colors, formulas, brands }) => {
      let filtered = colors;

      // 按产地筛选品牌
      if (params.region) {
        const regionBrandIds = brands
          .filter((b) => b.region === params.region)
          .map((b) => b.id);
        filtered = filtered.filter((c) => regionBrandIds.includes(c.make_id));
      }

      // 按品牌筛选
      if (params.make_id) filtered = filtered.filter((c) => c.make_id === params.make_id);

      // 按颜色代码筛选
      if (params.color_code) {
        const code = params.color_code!.toUpperCase();
        filtered = filtered.filter((c) => c.color_code.toUpperCase().includes(code));
      }

      // 按颜色名称筛选
      if (params.color_name) {
        const name = params.color_name!.toLowerCase();
        filtered = filtered.filter((c) => c.color_name.toLowerCase().includes(name));
      }

      // 按颜色类型筛选
      if (params.color_type) filtered = filtered.filter((c) => c.color_type.toLowerCase() === params.color_type);

      // 按年份筛选
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
        // 精确年份搜索时只展开展示匹配的年份，否则展示全部年份
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

  // 背景模糊层样式（will-change 硬件加速，opacity 过渡避免 filter 动画掉帧）
  // 使用负 inset（比容器大 40px）代替 scale，彻底消除缩放抖动
  const BLUR_LAYER_SX = {
    position: "absolute",
    top: -20,
    right: -20,
    bottom: -20,
    left: -20,
    backgroundImage: "url(/bg-home.png)",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    filter: "blur(12px) saturate(1.2)",
    willChange: "opacity",
    transitionProperty: "opacity",
    transitionDuration: "1.5s",
    transitionTimingFunction: "ease",
    opacity: shouldBeBlurred ? 1 : 0,
    zIndex: 0,
  } as const;

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>

      {/* 双层背景：清晰层 + 模糊层（通过 opacity 过渡实现丝滑模糊切换） */}
      <Box
        sx={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/bg-home.png)", backgroundSize: "cover",
          backgroundPosition: "center top", backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", zIndex: 0,
        }}
      />
      <Box ref={blurLayerRef} sx={BLUR_LAYER_SX} />

      {/* 遮罩（保留结构便于后续调整） */}
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0)", zIndex: 1 }} />

      {/* 页面内容 */}
      <Box sx={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", flex: 1 }}>
        <SiteHeader />
        <Box component="section" sx={{ flex: 1, display: "flex", flexDirection: "column", pt: 10, pb: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem", lg: "3.25rem" },
                  lineHeight: 1.2,
                  color: "primary.main",
                  letterSpacing: "-0.02em",
                }}
              >
                {t.heroTitlePrefix} {t.heroTitleHighlight}
              </Typography>
            </Box>

            {/* 玻璃拟态搜索框容器 */}
            <Box
              ref={glassRef}
              onMouseEnter={handleGlassEnter}
              onMouseLeave={handleGlassLeave}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 2,
                // 玻璃拟态：半透明白底 + 毛玻璃
                bgcolor: shouldBeBlurred ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)",
                backdropFilter: shouldBeBlurred ? "blur(16px)" : "blur(8px)",
                WebkitBackdropFilter: shouldBeBlurred ? "blur(16px)" : "blur(8px)",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: shouldBeBlurred
                  ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)"
                  : "0 4px 16px rgba(0,0,0,0.04)",
                willChange: "background-color, backdrop-filter, box-shadow",
                transitionProperty: "background-color, backdrop-filter, box-shadow",
                transitionDuration: "1.5s",
                transitionTimingFunction: "ease",
              }}
            >
              <SearchPanel
                onSearch={handleSearch}
                isLoading={isLoading}
                onFocusCapture={handleGlassFocus}
                onBlurCapture={handleGlassBlur}
              />
            </Box>
          </Container>
          {hasSearched && (
            <Box sx={{ mx: { xs: 1, sm: 3, md: "60px" }, mt: 2.5 }}>
              <SearchResults rows={tableRows} isLoading={isLoading} hasSearched={hasSearched} onOpenFormula={handleOpenFormula} />
            </Box>
          )}
        </Box>
        <Footer />
        <FormulaDrawer result={drawerResult} formulaId={drawerFormulaId} initialYear={drawerYear} onClose={() => setDrawerResult(null)} />
      </Box>
    </Box>
  );
}
