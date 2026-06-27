"use client";

import { useState, useRef, useEffect } from "react";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";
import FormulaDrawer from "@/components/FormulaDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getMockSearchResults } from "@/lib/mock-data";
import type { SearchParams, SearchResult } from "@/types";

interface AuthUser {
  username: string;
  role: string;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [drawerResult, setDrawerResult] = useState<SearchResult | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const submitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated) {
          setAuthUser(data.user);
        }
      });
  }, []);

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

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 顶部 Header - 移动端自适应 */}
      <header
        className="flex h-auto min-h-[64px] flex-col items-center gap-2 px-4 py-3 sm:h-[96px] sm:flex-row sm:px-[40px]"
        style={{ background: "linear-gradient(to right, #8B5CF6, #0D9488)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/haiwen.png"
            alt="HAIWEN"
            className="h-10 w-10 object-contain sm:h-[90px] sm:w-[90px]"
          />
          <span
            className="text-lg font-extrabold text-white sm:text-[28px]"
            style={{
              letterSpacing: "1px",
              fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
            }}
          >
            HAIWEN MIX
          </span>
        </div>

        {/* 右侧：用户信息 + 语言切换 */}
        <div className="ml-0 flex items-center gap-3 sm:ml-auto sm:gap-4">
          {authUser && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 sm:text-sm">
                {authUser.username}
                {authUser.role === "admin" && (
                  <a href="/admin/users" className="ml-1 text-[10px] text-white/60 hover:text-white sm:ml-2 sm:text-xs">管理</a>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-white/40 px-2 py-0.5 text-[10px] text-white transition-colors hover:bg-white/10 sm:px-3 sm:py-1 sm:text-xs"
              >
                退出
              </button>
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* 导航栏 - 移动端可横向滚动 */}
      <nav className="flex h-12 items-center overflow-x-auto border-b border-gray-100 bg-white px-4 scrollbar-hide sm:px-10">
        <a href="/" className="mr-6 shrink-0 border-b-2 border-blue-600 pb-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:mr-8">
          Formula Search
        </a>
        <a href="/color-library" className="mr-6 shrink-0 pb-3 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-900 sm:mr-8">
          Color Visual Library
        </a>
        <a href="/application-guide" className="shrink-0 pb-3 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-900">
          Application Guide
        </a>
      </nav>

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
