"use client";

import { useState, useEffect } from "react";
import type { Formula, FormulaComponent } from "@/types";
import { useLang } from "@/components/LanguageContext";

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

interface KapciFormulaTableProps {
  formula: Formula;
}

function calcWeight(gramsPer100g: number, totalGrams: number): number {
  return Math.round((gramsPer100g / 100) * totalGrams * 10) / 10;
}

function parsePositiveNumber(raw: string): number | null {
  if (raw === "") return null;
  const num = Number(raw);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 10) / 10;
}

function massToneColor(comp: FormulaComponent): string {
  const { rgb_r, rgb_g, rgb_b } = comp;
  if (rgb_r != null && rgb_g != null && rgb_b != null) {
    return `rgb(${rgb_r}, ${rgb_g}, ${rgb_b})`;
  }
  return "#E2E8F0";
}

export default function KapciFormulaTable({ formula }: KapciFormulaTableProps) {
  const { t } = useLang();
  const [volume, setVolume] = useState(1);
  const [unit, setUnit] = useState<Unit>("kg");
  const [weights, setWeights] = useState<number[]>([]);

  const totalGrams = volume * UNIT_MULTIPLIER[unit];

  // 体积/单位变化或配方切换时按新总量重置所有行权重
  useEffect(() => {
    const next = formula.components.map((c) => calcWeight(c.grams_per_100g, totalGrams));
    setWeights(next);
  }, [formula.id, totalGrams]);

  function handleVolumeChange(raw: string) {
    const num = parsePositiveNumber(raw);
    if (num === null) return;
    setVolume(Math.max(0.1, Math.round(num * 10) / 10));
  }

  function handleWeightChange(idx: number, raw: string) {
    const num = parsePositiveNumber(raw);
    if (num === null) return;
    setWeights((prev) => {
      const next = [...prev];
      next[idx] = num;
      return next;
    });
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2.5">
        <label className="text-[11px] font-medium text-[#64748B]">{t.volume}</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={volume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          className="h-8 w-[90px] rounded-md border border-[#E2E8F0] bg-white px-2 text-center text-sm text-[#0F172A] outline-none transition-colors focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20"
        />
        <span className="text-[11px] text-[#94A3B8]">&times;</span>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="h-8 w-[80px] rounded-md border border-[#E2E8F0] bg-white px-2 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
        <span className="ml-1 text-[11px] text-[#64748B]">
          = {totalGrams.toLocaleString()} g total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-[#64748B]">
              <th className="align-middle whitespace-nowrap pb-3 pr-3 text-[11px] font-medium">{t.tonerCode}</th>
              <th className="align-middle whitespace-nowrap pb-3 pr-3 text-[11px] font-medium">{t.tonerName}</th>
              <th className="align-middle whitespace-nowrap pb-3 pr-3 text-[11px] font-medium">{t.weight}</th>
              <th className="align-middle whitespace-nowrap pb-3 pr-3 text-[11px] font-medium">{t.accum}</th>
              <th className="align-middle whitespace-nowrap pb-3 text-[11px] font-medium">{t.massTone}</th>
            </tr>
          </thead>
          <tbody>
            {formula.components.map((comp, idx) => {
              let running = 0;
              for (let i = 0; i <= idx; i++) {
                running += weights[i] ?? 0;
              }

              return (
                <tr key={comp.toner_code} className="border-b border-zinc-100 last:border-b-0">
                  <td className="align-middle h-11 py-2 pr-3 font-mono text-[11px] text-[#94A3B8]">{comp.toner_code}</td>
                  <td className="align-middle h-11 py-2 pr-3 text-xs text-[#0F172A]">{comp.toner_name}</td>
                  <td className="align-middle h-11 py-2 pr-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={weights[idx] ?? ""}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      className="h-8 w-24 rounded-md border border-[#E2E8F0] bg-white px-2 text-right text-xs text-[#0F172A] outline-none transition-colors focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20"
                    />
                  </td>
                  <td className="align-middle h-11 py-2 pr-3 text-right tabular-nums text-xs font-medium text-[#0F172A]">
                    {running.toFixed(1)}
                  </td>
                  <td className="align-middle h-11 py-2">
                    <div
                      className="h-7 w-14 rounded border border-[#E2E8F0]"
                      style={{ backgroundColor: massToneColor(comp) }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#E2E8F0] bg-[#F8FAFC]">
              <td colSpan={2} className="py-3 pr-3"></td>
              <td className="py-3 pr-3 text-center text-[11px] font-medium text-[#64748B]">
                {t.totalWeightLabel}
              </td>
              <td className="py-3 pr-3 text-center tabular-nums text-xs font-semibold text-[#0F172A]">
                {totalWeight.toFixed(1)} g
              </td>
              <td className="py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
