"use client";

import { useState, useRef, useEffect } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import SiteHeader from "@/components/SiteHeader";
import Navigation from "@/components/Navigation";
import { getMockSearchResults } from "@/lib/mock-data";
import type { SearchParams, SearchResult } from "@/types";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);

  const submitRef = useRef<(() => void) | null>(null);

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

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SiteHeader />

      <Navigation />

      {/* 搜索筛选区 */}
      <div className="bg-white px-4 py-5 sm:px-[40px] sm:py-[28px]">
        <SearchPanel
          onSearch={handleSearch}
          isLoading={isLoading}
          onSubmitRef={submitRef}
        />
      </div>

      {/* 结果展示区域 */}
      <div className="mx-4 mb-8 rounded-[16px] border-[1.5px] border-[#E5E7EB] bg-white p-4 sm:mx-[40px] sm:mb-[40px] sm:p-6">
        <SearchResults
          results={searchResults}
          isLoading={isLoading}
          hasSearched={hasSearched}
          onOpenDetail={handleOpenDetail}
        />
      </div>

      <FormulaDrawer result={drawerResult} onClose={handleCloseDrawer} />
    </div>
  );
}
