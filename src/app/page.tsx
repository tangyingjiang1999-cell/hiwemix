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
      {/* 顶部 Header */}
      <header
        className="flex h-[96px] items-center px-[40px]"
        style={{ background: "linear-gradient(to right, #8B5CF6, #0D9488)" }}
      >
        <div className="flex items-center gap-4">
          <img
            src="/haiwen.png"
            alt="HAIWEN"
            className="h-[90px] w-[90px] object-contain"
          />
          <span
            className="text-[28px] font-extrabold text-white"
            style={{
              letterSpacing: "2px",
              fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
            }}
          >
            HAIWEN MIX
          </span>
        </div>

        {/* 右侧：用户信息 + 语言切换 */}
        <div className="ml-auto flex items-center gap-4">
          {authUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80">
                {authUser.username}
                {authUser.role === "admin" && (
                  <a href="/admin/users" className="ml-2 text-xs text-white/60 hover:text-white">管理</a>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-white/40 px-3 py-1 text-xs text-white transition-colors hover:bg-white/10"
              >
                退出
              </button>
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* 导航栏 - Tesla 风格：精确、最小间距 */}
      <nav className="flex h-12 items-center border-b border-gray-100 bg-white px-10">
        <a href="/" className="mr-8 border-b-2 border-blue-600 pb-3 text-sm font-medium text-gray-900">
          Formula Search
        </a>
        <a href="/color-library" className="mr-8 pb-3 text-sm font-medium text-gray-500 hover:text-gray-900">
          Color Visual Library
        </a>
        <a href="/application-guide" className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-900">
          Application Guide
        </a>
      </nav>

      {/* 搜索筛选区 */}
      <div className="bg-white px-[40px] py-[28px]">
        <SearchPanel
          onSearch={handleSearch}
          isLoading={isLoading}
          onSubmitRef={submitRef}
        />
      </div>

      {/* 结果展示区域 */}
      <div className="mx-[40px] mb-[40px] rounded-[16px] border-[1.5px] border-[#E5E7EB] bg-white p-6">
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
