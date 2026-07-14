"use client";

import { useState, useEffect, useRef } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, Color, Formula, SearchParams, SearchResult, FormulaTableRow } from "@/types";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function Home() {
  const { t } = useLang();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [tableRows, setTableRows] = useState<FormulaTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);
  const [drawerInitialIdx, setDrawerInitialIdx] = useState(0);

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
        // 年份范围匹配：将 year_range 如 "2018-2022" 解析为起止年份，检查输入年份是否落在区间内
        const searchYear = parseInt(params.year, 10);
        if (!isNaN(searchYear)) {
          filtered = filtered.filter((c) =>
            c.variants.some((v) => {
              const parts = v.year_range.split("-").map((s) => parseInt(s.trim(), 10));
              const minY = parts[0] || 0;
              const maxY = parts[1] || parts[0] || 9999;
              return searchYear >= minY && searchYear <= maxY;
            })
          );
        }
      }
      const results: SearchResult[] = filtered.map((color) => ({
        color,
        formulas: formulas.filter((f) => f.color_id === color.id),
      }));
      const brandsMap = new Map(brands.map((b) => [b.id, b.name]));
      const rows: FormulaTableRow[] = [];
      for (const r of results) {
        for (const f of r.formulas) {
          rows.push({
            color: r.color,
            formula: f,
            variant: r.color.variants.find((v) => v.id === f.variant_id),
            makeName: brandsMap.get(r.color.make_id) ?? r.color.make_id,
          });
        }
      }
      setSearchResults(results);
      setTableRows(rows);
    }).catch((err) => { console.error(err); setSearchResults([]); }).finally(() => setIsLoading(false));
  }

  function handleOpenFormula(row: FormulaTableRow) {
    const r = searchResults.find((x) => x.color.id === row.color.id);
    if (!r) return;
    const idx = r.formulas.findIndex((f) => f.id === row.formula.id);
    setDrawerResult(r);
    setDrawerInitialIdx(idx >= 0 ? idx : 0);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <SiteHeader />
      <Box component="section" sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", pt: 10, pb: 4 }}>
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
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
            <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
          </Paper>
        </Container>
        {hasSearched && (
          <Box sx={{ mx: "60px", mt: 2.5 }}>
            <SearchResults rows={tableRows} isLoading={isLoading} hasSearched={hasSearched} onOpenFormula={handleOpenFormula} />
          </Box>
        )}
      </Box>
      <Footer />
      <FormulaDrawer result={drawerResult} initialFormulaIdx={drawerInitialIdx} onClose={() => setDrawerResult(null)} />
    </Box>
  );
}
