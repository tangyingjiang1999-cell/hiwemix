"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";
import type { FormulaTableRow } from "@/types";

export interface SearchResultsProps {
  rows: FormulaTableRow[];
  isLoading: boolean;
  hasSearched: boolean;
  onOpenFormula: (row: FormulaTableRow) => void;
}

// 生成 Kapci 风格渐变色：主色为底，水平方向中间宽高光，上下同色相阴影
function colorSwatchStyle(hex: string): React.CSSProperties {
  return {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 16%, rgba(0,0,0,0) 32%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0.28) 58%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.12) 84%, rgba(0,0,0,0.32) 100%)",
  };
}

function SkeletonRows() {
  return (
    <div className="space-y-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex h-12 animate-pulse items-center gap-3 border-b border-zinc-100 px-2"
        >
          <div className="h-8 w-8 shrink-0 rounded bg-zinc-200" />
          <div className="h-3 flex-1 rounded bg-zinc-200" />
          <div className="h-3 w-20 rounded bg-zinc-100" />
          <div className="h-3 w-16 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}

// 窗口式页码：超 7 页时显示首尾 + 当前页附近 + 省略号
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function SearchResults({
  rows,
  isLoading,
  hasSearched,
  onOpenFormula,
}: SearchResultsProps) {
  const { t } = useLang();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 搜索结果变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  if (isLoading) {
    return (
      <div className="space-y-0">
        <SkeletonRows />
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <p className="text-[11px] text-gray-500">{t.searchHint}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <svg
          className="mb-4 h-14 w-14 text-zinc-300"
          fill="none"
          viewBox="0 0 32 32"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13" cy="13" r="8" />
          <line x1="19" y1="19" x2="26" y2="26" />
          <text
            x="13"
            y="25"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontSize="16"
            fontWeight="600"
          >
            ?
          </text>
        </svg>
        <p className="text-xs font-medium text-[#6B7280]">{t.noResults}</p>
        <p className="mt-1 text-[11px] text-gray-500">{t.noResultsHint}</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = rows.slice(startIdx, startIdx + pageSize);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div>
      {/* 结果计数 */}
      <p className="mb-3 text-[11px] text-gray-500">
        {t.foundFormulas(rows.length)}
      </p>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-[#EBEBEB]">
        <table className="w-full min-w-[760px] table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[23%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#F5F5F5] text-xs font-medium text-[#A1A1A1]">
              <th className="px-2 py-2.5"></th>
              <th className="px-2 py-2.5">{t.manufacturerLabel}</th>
              <th className="px-2 py-2.5">{t.codeLabel}</th>
              <th className="px-2 py-2.5">{t.colorName}</th>
              <th className="px-2 py-2.5">{t.yearsLabel}</th>
              <th className="px-2 py-2.5">{t.versionLabel}</th>
              <th className="px-2 py-2.5 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.formula.id}
                className="border-b border-zinc-100 last:border-b-0 transition-colors hover:bg-[#F5F5F5]"
              >
                {/* 色块 — 2:1 宽高比，Kapci 水平中高光 */}
                <td className="px-2 py-2.5">
                  <div className="relative w-full pb-[50%]">
                    <div
                      className="absolute inset-0 rounded border border-[#E5E7EB]"
                      style={colorSwatchStyle(row.color.hex_preview)}
                    />
                  </div>
                </td>
                {/* Manufacturer */}
                <td className="overflow-hidden px-2 py-2.5">
                  <span className="block truncate text-[#0F172A]">
                    {row.makeName}
                  </span>
                </td>
                {/* Color Code */}
                <td className="px-2 py-2.5">
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    {row.color.color_code}
                  </span>
                </td>
                {/* Color Name */}
                <td className="overflow-hidden px-2 py-2.5">
                  <span className="block truncate text-[#0F172A]">
                    {row.color.color_name}
                  </span>
                </td>
                {/* Year */}
                <td className="px-2 py-2.5">
                  <span className="text-[#64748B]">
                    {row.variant?.year_range ?? "-"}
                  </span>
                </td>
                {/* Version */}
                <td className="px-2 py-2.5">
                  <span className="text-[#0F172A]">{row.formula.version}</span>
                </td>
                {/* 放大镜 */}
                <td className="px-2 py-2.5 text-center">
                  <button
                    onClick={() => onOpenFormula(row)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#0D9488]/10 hover:text-[#0D9488]"
                    aria-label="View formula"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="11" cy="11" r="7" />
                      <line
                        x1="16"
                        y1="16"
                        x2="21"
                        y2="21"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页栏 */}
      <div className="mt-3 flex flex-col items-center justify-between gap-2 sm:flex-row">
        {/* 每页条数 */}
        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
          <span>{t.pageSizeLabel}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] text-[#0F172A] outline-none focus:border-[#0D9488]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* 页码导航 */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage <= 1}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] transition-colors",
                safePage <= 1
                  ? "cursor-not-allowed text-gray-300"
                  : "text-[#64748B] hover:bg-[#F3F4F6]"
              )}
            >
              {t.previousPage}
            </button>

            {pageNumbers.map((pn, i) =>
              pn === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1 text-[11px] text-[#94A3B8]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pn}
                  onClick={() => setCurrentPage(pn)}
                  className={cn(
                    "min-w-[28px] rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                    pn === safePage
                      ? "bg-[#0D9488] text-white"
                      : "text-[#64748B] hover:bg-[#F3F4F6]"
                  )}
                >
                  {pn}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] transition-colors",
                safePage >= totalPages
                  ? "cursor-not-allowed text-gray-300"
                  : "text-[#64748B] hover:bg-[#F3F4F6]"
              )}
            >
              {t.nextPage}
            </button>
          </div>
        )}
      </div>

      {/* 页码信息 */}
      <p className="mt-2 text-center text-[10px] text-[#94A3B8] sm:text-right">
        {t.pageOf(safePage, totalPages)}
      </p>
    </div>
  );
}
