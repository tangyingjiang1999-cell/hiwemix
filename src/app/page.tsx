"use client";

import { useState } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import { getMockSearchResults, mockFormulas, mockColors } from "@/lib/mock-data";
import type { SearchParams, SearchResult } from "@/types";

// 特性卡片数据
const features = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Fast Search",
    desc: "Get results in seconds. Our high-performance indexing ensures you find exact matches without waiting.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Accurate Formulas",
    desc: "Precision color matching for every vehicle. Lab-tested recipes ensure flawless blending and coverage.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "OEM Codes",
    desc: "Full database of original manufacturer codes. Direct access to manufacturer-approved specifications.",
  },
];

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);

  function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      const results = getMockSearchResults(params);
      setSearchResults(results);
      setIsLoading(false);
    }, 600);
  }

  function handleOpenDetail(result: SearchResult) {
    setDrawerResult(result);
  }

  function handleCloseDrawer() {
    setDrawerResult(null);
  }

  // 从 mock 数据取前 5 条配方用于预览表
  const recentFormulas = mockFormulas.slice(0, 5).map((f) => {
    const color = mockColors.find((c) => c.id === f.color_id);
    return { ...f, color };
  });

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <SiteHeader />

      {/* ===== Hero 区域 ===== */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-24 pb-16">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7fafc] via-[#f7fafc] to-[#006565]/5" />
          <div className="absolute top-20 right-0 h-[600px] w-[600px] rounded-full bg-[#006565]/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-5 lg:px-10">
          <div className="mx-auto max-w-4xl">
            {/* 搜索表单卡片 */}
            <div className="rounded-xl border border-[#bdc9c8]/50 bg-white p-6 shadow-sm">
              <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 搜索结果区域（有搜索时显示） ===== */}
      {hasSearched && (
        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-10">
          <div className="rounded-xl border border-[#bdc9c8]/50 bg-white p-6 shadow-sm">
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              hasSearched={hasSearched}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        </section>
      )}

      {/* ===== Why Choose HAIWEN MIX ===== */}
      <section className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-semibold text-[#181c1e]">Why Choose HAIWEN MIX?</h2>
            <div className="mx-auto h-1 w-16 rounded-full bg-[#006565]" />
            <p className="mx-auto max-w-2xl text-[#3e4949]">
              Our platform is engineered for speed and reliability, providing body shop professionals
              with the tools they need to achieve a flawless finish every time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="group rounded-xl border border-[#bdc9c8]/50 bg-white p-8 transition-all duration-300 hover:border-[#006565]/30 hover:shadow-xl"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#006565]/10 text-[#006565] transition-transform group-hover:scale-110">
                  {feat.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#181c1e]">{feat.title}</h3>
                <p className="text-[#3e4949]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Recent Formulas 预览表 ===== */}
      <section className="bg-[#ebeef0] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-[#bdc9c8]/50 bg-white shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-[#bdc9c8]/50 p-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold text-[#181c1e]">Recent Formulas</h3>
                <p className="mt-1 text-xs text-[#3e4949]">
                  Latest formulas from the HAIWEN database
                </p>
              </div>
              <a
                href="/"
                className="rounded-lg border border-[#006565] px-5 py-2 text-sm font-semibold text-[#006565] transition-colors hover:bg-[#006565]/10"
              >
                Search Database
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[#bdc9c8]/50 bg-[#e5e9eb]">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-[#181c1e]">Color Code</th>
                    <th className="px-6 py-3 text-sm font-semibold text-[#181c1e]">Manufacturer</th>
                    <th className="px-6 py-3 text-sm font-semibold text-[#181c1e]">Description</th>
                    <th className="px-6 py-3 text-sm font-semibold text-[#181c1e]">System</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#181c1e]">Components</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bdc9c8]/30">
                  {recentFormulas.map((f, i) => (
                    <tr
                      key={f.id}
                      className={`transition-colors hover:bg-[#006565]/5 ${i % 2 === 1 ? "bg-[#f1f4f6]/50" : ""}`}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium tracking-wider text-[#006565]">
                        {f.color?.color_code || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#181c1e] capitalize">
                        {f.color?.make_id || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#181c1e]">
                        {f.color?.color_name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${f.paint_system === "2K" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {f.paint_system}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-[#3e4949]">
                        {f.components.length} toners
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#2d3133] text-[#bdc9c8]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-16 md:grid-cols-4 lg:px-10">
          <div className="space-y-4">
            <div className="text-lg font-bold text-white">HAIWEN MIX</div>
            <p className="text-sm leading-relaxed">
              Empowering automotive refinishing experts with precision data and cutting-edge
              mixing technology since 2012.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider text-[#76d6d5] uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="transition-colors hover:text-[#76d6d5]">Formula Search</a></li>
              <li><a href="/color-library" className="transition-colors hover:text-[#76d6d5]">Color Visual Library</a></li>
              <li><a href="/application-guide" className="transition-colors hover:text-[#76d6d5]">Application Guide</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider text-[#76d6d5] uppercase">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:text-[#76d6d5]">Contact Support</a></li>
              <li><a href="#" className="transition-colors hover:text-[#76d6d5]">Global Distributors</a></li>
              <li><a href="#" className="transition-colors hover:text-[#76d6d5]">Training Portal</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider text-[#76d6d5] uppercase">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:text-[#76d6d5]">Privacy Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-[#76d6d5]">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#bdc9c8]/20 px-5 py-6 text-center lg:px-10 md:text-left">
          <p className="text-xs text-[#bdc9c8]/60">
            © 2024 HAIWEN MIX. Professional Automotive Refinishing Systems.
          </p>
        </div>
      </footer>

      <FormulaDrawer result={drawerResult} onClose={handleCloseDrawer} />
    </div>
  );
}
