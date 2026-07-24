"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/LanguageContext";
import { colorSwatchStyle } from "@/lib/utils";
import type { FormulaTableRow } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchSlash, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export interface SearchResultsProps {
  rows: FormulaTableRow[];
  isLoading: boolean;
  hasSearched: boolean;
  onOpenFormula: (row: FormulaTableRow) => void;
}

function SkeletonRows() {
  return (
    <TableBody>
      {[0, 1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-10 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="size-7 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

// ===== 内联分页器组件 =====
function CustomPagination({
  totalCount,
  page,
  pageSize,
  onPageChange,
  unitName = "formulas",
}: {
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  unitName?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm font-semibold text-primary" aria-live="polite">
        Found {totalCount} {unitName}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-2xs text-muted-foreground">
          {page + 1} / {totalPages}
        </span>
        <Button
          size="icon"
          variant="ghost"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:text-muted-foreground/50"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:text-muted-foreground/50"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SearchResults({
  rows,
  isLoading,
  hasSearched,
  onOpenFormula,
}: SearchResultsProps) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="mb-1">
          <Skeleton className="h-4 w-44" />
        </div>
        <Table>
          <SkeletonRows />
        </Table>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">{t.searchHint}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-3" role="status">
        <SearchSlash aria-hidden="true" className="mb-2 size-14 text-muted-foreground" />
        <p className="text-base font-semibold text-foreground">{t.noResults}</p>
        <p className="mt-1 text-2xs font-medium text-muted-foreground">{t.noResultsHint}</p>
      </div>
    );
  }

  const pageRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="mx-0 sm:-mx-1">
      <div className="overflow-x-auto rounded-none border border-border border-t-2 border-t-primary">
        <Table>
          <caption className="sr-only">Formula search results table</caption>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-[105px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none">Color Type</TableHead>
              <TableHead className="w-[125px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none">{t.manufacturerLabel}</TableHead>
              <TableHead className="w-[100px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none">{t.codeLabel}</TableHead>
              <TableHead className="w-[150px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none">{t.colorName}</TableHead>
              <TableHead className="hidden w-[150px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none md:table-cell">{t.carModelLabel}</TableHead>
              <TableHead className="hidden w-[120px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none md:table-cell">{t.yearsLabel}</TableHead>
              <TableHead className="hidden w-[120px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none md:table-cell">Process</TableHead>
              <TableHead className="hidden w-[100px] py-2.5 text-center text-xs font-semibold text-primary-foreground border-none md:table-cell">{t.versionLabel}</TableHead>
              <TableHead className="w-[60px] py-2.5 border-none" aria-label="Actions"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, index) => (
              <TableRow
                key={`${row.formula.id}-${index}`}
                className="cursor-pointer transition-colors hover:bg-blue-50/40 border-b border-border/50 last:border-b-0"
                onClick={() => onOpenFormula(row)}
              >
                <TableCell className="py-3.5 text-center">
                  <div
                    className="mx-auto w-[83px] h-[37px] border border-border"
                    style={colorSwatchStyle(row.color.hex_preview)}
                  />
                </TableCell>
                <TableCell className="py-3.5 text-center">
                  <span className="text-2xs font-medium text-foreground truncate block">{row.makeName}</span>
                </TableCell>
                <TableCell className="py-3.5 text-center">
                  <span className="text-2xs font-medium text-foreground/80">{row.color.color_code}</span>
                </TableCell>
                <TableCell className="py-3.5 text-center">
                  <span className="text-2xs font-medium text-foreground truncate block">{row.color.color_name}</span>
                </TableCell>
                <TableCell className="hidden py-3.5 text-center md:table-cell">
                  <span className="text-2xs font-medium text-foreground/80 truncate block">{row.color.car_model || "—"}</span>
                </TableCell>
                <TableCell className="hidden py-3.5 text-center md:table-cell">
                  <span className="text-sm text-muted-foreground">{row.year ?? "—"}</span>
                </TableCell>
                <TableCell className="hidden py-3.5 text-center md:table-cell">
                  <span className="text-2xs font-medium text-foreground/80 truncate block">{row.formula.formula_type}</span>
                </TableCell>
                <TableCell className="hidden py-3.5 text-center md:table-cell">
                  <span className="text-2xs font-medium text-foreground/80">{row.formula.version}</span>
                </TableCell>
                <TableCell align="center" className="py-3.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onOpenFormula(row); }}
                    aria-label="View formula"
                    className="size-8 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CustomPagination
          totalCount={rows.length}
          page={page}
          pageSize={rowsPerPage}
          onPageChange={setPage}
          unitName="formulas"
        />
      </div>
    </div>
  );
}
