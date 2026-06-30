"use client";

import ColorCard from "./ColorCard";
import { MAX_SEARCH_RESULTS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { SearchResult } from "@/types";

export interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  hasSearched: boolean;
  onOpenDetail: (result: SearchResult) => void;
}

function SkeletonCard() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-4">
      <div className="h-10 w-10 shrink-0 rounded-md bg-zinc-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 rounded bg-zinc-200" />
        <div className="h-3 w-1/4 rounded bg-zinc-100" />
      </div>
      <div className="h-5 w-12 rounded bg-zinc-200" />
      <div className="h-5 w-8 rounded bg-zinc-100" />
    </div>
  );
}

export default function SearchResults({
  results,
  isLoading,
  hasSearched,
  onOpenDetail,
}: SearchResultsProps) {
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-muji-caption">{t.searchHint}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
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
        <p className="text-muji-body font-muji-500 text-[#6B7280]">{t.noResults}</p>
        <p className="mt-1 text-muji-caption">{t.noResultsHint}</p>
      </div>
    );
  }

  const displayResults = results.slice(0, MAX_SEARCH_RESULTS);
  const truncated = results.length > MAX_SEARCH_RESULTS;

  return (
    <div>
      <p className="mb-3 text-muji-caption">
        {t.foundCount(results.length)}
      </p>

      <div className="space-y-0">
        {displayResults.map((result) => (
          <ColorCard
            key={result.color.id}
            result={result}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>

      {truncated && (
        <p className="mt-4 text-center text-muji-caption">
          {t.truncatedHint(MAX_SEARCH_RESULTS)}
        </p>
      )}
    </div>
  );
}
