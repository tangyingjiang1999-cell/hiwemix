"use client";

import { useState } from "react";
import type { Formula, FormulaComponent } from "@/types";
import { useLang } from "@/components/LanguageContext";

// ============================================================
// 单位选项
// ============================================================
const UNIT_OPTIONS = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "liter", label: "liter" },
] as const;

type Unit = (typeof UNIT_OPTIONS)[number]["value"];

const UNIT_MULTIPLIER: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  liter: 1000,
};

// ============================================================
// FormulaComponentsTable Props
// ============================================================
interface FormulaComponentsTableProps {
  formula: Formula;
}

function calcActualGrams(
  gramsPer100g: number,
  volume: number,
  unit: Unit,
): number {
  const totalGrams = volume * UNIT_MULTIPLIER[unit];
  return Math.round(((gramsPer100g / 100) * totalGrams) * 10) / 10;
}

export default function FormulaComponentsTable({
  formula,
}: FormulaComponentsTableProps) {
  const { t } = useLang();
  const [volume, setVolume] = useState<number | "">(100);
  const [unit, setUnit] = useState<Unit>("g");

  const totalGrams =
    volume !== "" && volume > 0 ? volume * UNIT_MULTIPLIER[unit] : 0;
  const hasValidVolume = totalGrams > 0;

  function handleVolumeChange(raw: string) {
    if (raw === "") {
      setVolume("");
      return;
    }
    const num = Number(raw);
    if (isNaN(num)) return;
    setVolume(Math.max(1, Math.min(9999, Math.floor(num))));
  }

  return (
    <div>
      {/* 用量换算控制行 */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-3">
        <label className="text-xs font-medium text-[#64748B]">
          {t.volume}
        </label>

        <input
          type="number"
          min={1}
          max={9999}
          value={volume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          className="h-8 w-[80px] rounded-md border border-[#E2E8F0] bg-white px-2 text-center text-sm text-[#0F172A] outline-none transition-colors focus:border-[#e84545] focus:ring-1 focus:ring-[#e84545]"
        />

        <span className="text-xs text-[#94A3B8]">&times;</span>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="h-8 w-[80px] rounded-md border border-[#E2E8F0] bg-white px-2 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#e84545] focus:ring-1 focus:ring-[#e84545]"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>

        {hasValidVolume && (
          <span className="ml-1 text-xs text-[#64748B]">
            = {totalGrams.toLocaleString()} g total
          </span>
        )}
      </div>

      {/* 成分表格 */}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-left text-[#64748B]">
            <th className="pb-2 pr-2 font-medium">{t.tonerCode}</th>
            <th className="pb-2 pr-2 font-medium">{t.tonerName}</th>
            <th className="pb-2 pr-2 font-medium">{t.percentage}</th>
            <th className="pb-2 font-medium">{t.actualAmount}</th>
          </tr>
        </thead>
        <tbody>
          {formula.components.map((comp: FormulaComponent) => {
            const actualGrams = hasValidVolume
              ? calcActualGrams(comp.grams_per_100g, volume as number, unit)
              : null;

            return (
              <tr
                key={comp.toner_code}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="py-2 pr-2 font-mono text-xs text-[#94A3B8]">
                  {comp.toner_code}
                </td>
                <td className="py-2 pr-2 text-[#0F172A]">
                  {comp.toner_name}
                </td>
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-full max-w-[60px] overflow-hidden rounded-full bg-zinc-100">
                      <div
                      className="h-full rounded-full bg-[#0F172A]"
                        style={{ width: `${comp.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right tabular-nums text-[#64748B]">
                      {comp.percentage}%
                    </span>
                  </div>
                </td>
                <td className="py-2 tabular-nums">
                  {actualGrams !== null ? (
                    <span className="font-semibold text-[#0F172A]">
                      {actualGrams.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-zinc-300">&mdash;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
