"use client";

import { memo, useState } from "react";
import type { SearchResult, Formula } from "@/types";
import { COLOR_TYPE_MAP } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import FormulaComponentsTable from "./FormulaComponentsTable";

interface ColorCardProps {
  result: SearchResult;
  onOpenDetail: (result: SearchResult) => void;
}

const ColorCard = memo(function ColorCard({
  result,
  onOpenDetail,
}: ColorCardProps) {
  const { color, formulas } = result;
  const { t, lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [activeFormulaIdx, setActiveFormulaIdx] = useState(0);

  const typeLabelMap: Record<string, Record<string, string>> = {
    en: { solid: "Solid", metallic: "Metallic", pearl: "Pearl", special: "Special" },
    zh: { solid: "实色", metallic: "金属漆", pearl: "珠光漆", special: "特殊漆" },
  };

  const typeInfo = COLOR_TYPE_MAP[color.color_type] ?? {
    label: color.color_type,
    badge: "bg-zinc-100 text-zinc-600",
  };
  const typeLabel = typeLabelMap[lang][color.color_type] ?? color.color_type;

  function toggleExpanded() {
    setExpanded(!expanded);
    if (expanded) setActiveFormulaIdx(0);
  }

  const activeFormula: Formula | undefined = formulas[activeFormulaIdx];

  return (
    <div className="mb-3 rounded-xl border border-[#E5E7EB] bg-white transition-shadow duration-200 ease-out hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] last:mb-0">
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <div
            className="h-10 w-10 shrink-0 rounded-[6px] border border-[#E5E7EB]"
            style={{ backgroundColor: color.hex_preview }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-bold text-[#111827]">
              {color.color_name}
            </p>
            <p className="text-[13px] font-normal text-[#9CA3AF]">{color.color_code}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={[
              "shrink-0 rounded-[6px] px-2 py-0.5 text-[12px] font-medium",
              typeInfo.badge,
            ].join(" ")}
          >
            {typeLabel}
          </span>

          <span className="shrink-0 text-[14px] text-[#6B7280]">
            {t.formulasCount(formulas.length)}
          </span>

          <button
            type="button"
            onClick={toggleExpanded}
            className="shrink-0"
            aria-label={expanded ? t.collapse : t.expand}
          >
            <svg
              className={[
                "h-4 w-4 text-[#9CA3AF] transition-transform duration-150",
                expanded ? "rotate-180" : "",
              ].join(" ")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(result);
            }}
            className="shrink-0 rounded-md border border-[#D1D5DB] px-2.5 py-1 text-[12px] font-medium text-[#111827] transition-all duration-200 ease-out hover:bg-[#F9FAFB]"
          >
            {t.detail}
          </button>
        </div>
      </div>

      <div
        className={[
          "overflow-hidden transition-all duration-150 ease-in-out",
          expanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="border-t border-[#E5E7EB] px-5 pb-4 pt-3">
          {formulas.length > 1 ? (
            <div className="mb-3 flex gap-1.5">
              {formulas.map((f, idx) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFormulaIdx(idx)}
                  className={[
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out",
                    idx === activeFormulaIdx
                      ? "bg-[#111827] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
                  ].join(" ")}
                >
                  {color.variants.find((v) => v.id === f.variant_id)?.name ??
                    f.variant_id}
                </button>
              ))}
            </div>
          ) : null}

          {activeFormula && (
            <div className="animate-[fadeIn_150ms_ease-in-out]">
              <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280]">
                <span>
                  {color.variants.find(
                    (v) => v.id === activeFormula.variant_id,
                  )?.name ?? activeFormula.variant_id}
                </span>
                <span className="text-[#D1D5DB]">|</span>
                <span>{t.version} {activeFormula.version}</span>
                <span className="text-[#D1D5DB]">|</span>
                <span
                  className={[
                    "rounded px-1.5 py-px text-[10px] font-semibold",
                    activeFormula.paint_system === "2K"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}
                >
                  {activeFormula.paint_system}
                </span>
              </div>

              <FormulaComponentsTable formula={activeFormula} />

              {activeFormula.notes && (
                <p className="mt-3 text-xs text-[#6B7280]">
                  <span className="font-medium text-[#111827]">{t.paintSystemNotes}: </span>
                  {activeFormula.notes}
                </p>
              )}
              <p className="mt-1 text-[11px] text-[#9CA3AF]">
                {t.updatedLabel} {activeFormula.updated_at}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ColorCard;
