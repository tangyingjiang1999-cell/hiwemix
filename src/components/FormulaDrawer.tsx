"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResult, Formula } from "@/types";
import { mockCarMakes } from "@/lib/mock-data";
import { COLOR_TYPE_MAP } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import FormulaComponentsTable from "./FormulaComponentsTable";
import Toast from "./Toast";

// ============================================================
// FormulaDrawer Props
// ============================================================
interface FormulaDrawerProps {
  result: SearchResult | null;
  onClose: () => void;
}

function formatFormulaAsText(
  result: SearchResult,
  activeFormula: Formula,
): string {
  const make =
    mockCarMakes.find((m) => m.id === result.color.make_id)?.name ??
    result.color.make_id;
  const variantName =
    result.color.variants.find((v) => v.id === activeFormula.variant_id)
      ?.name ?? activeFormula.variant_id;

  const lines: string[] = [];
  lines.push("=".repeat(50));
  lines.push(`HIWE Formula - ${result.color.color_name}`);
  lines.push(`Color Code: ${result.color.color_code}`);
  lines.push(`Make: ${make}`);
  lines.push(`Type: ${result.color.color_type}`);
  lines.push(`Variant: ${variantName}`);
  lines.push(`Paint System: ${activeFormula.paint_system}`);
  lines.push(`Version: ${activeFormula.version}`);
  lines.push("-".repeat(50));
  lines.push("Toner Code  |  Toner Name       |    %  |  g/100g");
  lines.push("-".repeat(50));
  for (const c of activeFormula.components) {
    lines.push(
      `${c.toner_code.padEnd(12)}|  ${c.toner_name.padEnd(17)}|  ${String(c.percentage).padStart(4)}% |  ${String(c.grams_per_100g).padStart(6)}g`,
    );
  }
  lines.push("-".repeat(50));
  if (activeFormula.notes) {
    lines.push(`Notes: ${activeFormula.notes}`);
  }
  lines.push(`Updated: ${activeFormula.updated_at}`);
  lines.push("=".repeat(50));
  return lines.join("\n");
}

// ============================================================
// FormulaModal 组件（原 FormulaDrawer 改为居中弹窗）
// ============================================================
export default function FormulaDrawer({ result, onClose }: FormulaDrawerProps) {
  const { t, lang } = useLang();
  const [activeFormulaIdx, setActiveFormulaIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 语言→类型标签映射
  const typeLabelMap: Record<string, Record<string, string>> = {
    en: {
      solid: t.colorTypeSolidLabel,
      metallic: t.colorTypeMetallicLabel,
      pearl: t.colorTypePearlLabel,
      special: t.colorTypeSpecialLabel,
    },
    zh: {
      solid: t.colorTypeSolidLabel,
      metallic: t.colorTypeMetallicLabel,
      pearl: t.colorTypePearlLabel,
      special: t.colorTypeSpecialLabel,
    },
  };

  useEffect(() => {
    if (result) {
      setActiveFormulaIdx(0);
      requestAnimationFrame(() => setVisible(true));
      // 弹窗打开时给页面主体添加模糊
      document.getElementById("page-content")?.classList.add("blur-bg");
    } else {
      setVisible(false);
      document.getElementById("page-content")?.classList.remove("blur-bg");
    }
    return () => {
      document.getElementById("page-content")?.classList.remove("blur-bg");
    };
  }, [result]);

  const handleClose = useCallback(() => {
    setVisible(false);
    document.getElementById("page-content")?.classList.remove("blur-bg");
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!result) return null;

  const { color, formulas } = result;
  const typeInfo = COLOR_TYPE_MAP[color.color_type] ?? {
    label: color.color_type,
    badge: "bg-zinc-100 text-zinc-600",
  };
  const typeLabel = typeLabelMap[lang][color.color_type] ?? color.color_type;
  const make =
    mockCarMakes.find((m) => m.id === color.make_id)?.name ?? color.make_id;
  const activeFormula = formulas[activeFormulaIdx];
  const years = color.variants.map((v) => v.year_range).join(", ");

  function handleCopy() {
    if (!activeFormula) return;
    const text = formatFormulaAsText(result!, activeFormula);
    navigator.clipboard.writeText(text).then(
      () => setToastMsg(t.copySuccess),
      () => setToastMsg(t.copyFail),
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={[
          "fixed inset-0 bg-black/40 transition-opacity duration-200",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        style={{ zIndex: 999 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 居中弹窗卡片 */}
      <div
        className={[
          "fixed flex flex-col bg-white overflow-hidden",
          "transition-all duration-200 ease-out",
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[0.96] pointer-events-none",
        ].join(" ")}
        style={{
          zIndex: 1000,
          top: "50%",
          left: "50%",
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.96)",
          width: "700px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-8 py-5 shrink-0">
          <div
            className="h-10 w-10 shrink-0 rounded-[6px] border border-[#E2E8F0]"
            style={{ backgroundColor: color.hex_preview }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-[#0F172A]">
              {color.color_name}
            </h2>
            <p className="text-[13px] text-[#94A3B8]">{color.color_code}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:text-[#0F172A]"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ padding: "24px 32px" }}>
          {/* Section 1：颜色信息 */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              {t.colorInfo}
            </h3>
            <div className="space-y-2 text-sm">
              <KV label={t.makeLabel} value={make} />
              <KV label={t.typeLabel}>
                <span
                  className={[
                    "rounded-[6px] px-2 py-0.5 text-xs font-medium",
                    typeInfo.badge,
                  ].join(" ")}
                >
                  {typeLabel}
                </span>
              </KV>
              <KV label={t.yearsLabel} value={years} />
              <KV label={t.codeLabel} value={color.color_code} />
            </div>
          </div>

          {/* Section 2：配方选择 Tab */}
          <div className="mb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {t.formulaVariants}
          </h3>
            <div className="flex flex-col gap-1.5">
              {formulas.map((f, idx) => {
                const variantName =
                  color.variants.find((v) => v.id === f.variant_id)?.name ??
                  f.variant_id;
                const isActive = idx === activeFormulaIdx;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFormulaIdx(idx)}
                    className={[
                      "flex items-center justify-between rounded-md px-4 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-[#0F172A]/10 text-[#0F172A] ring-1 ring-[#0F172A]/20"
                        : "bg-slate-50 text-[#64748B] hover:bg-slate-100",
                    ].join(" ")}
                  >
                    <span className="font-medium">{variantName}</span>
                    <span
                      className={[
                        "rounded px-1.5 py-px text-[11px] font-semibold",
                        f.paint_system === "2K"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700",
                      ].join(" ")}
                    >
                      {f.paint_system}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3：配方详情 */}
          {activeFormula && (
            <div className="animate-[fadeIn_150ms_ease-in-out]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                {t.components}
              </h3>

              <div className="mb-3 flex items-center gap-2 text-xs text-[#64748B]">
                <span>{t.version} {activeFormula.version}</span>
                <span className="text-[#CBD5E1]">|</span>
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
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3">
                  <p className="text-xs font-medium text-amber-800">{t.notesLabel}</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {activeFormula.notes}
                  </p>
                </div>
              )}

              <p className="mt-3 text-xs text-zinc-400">
                {t.updatedLabel} {activeFormula.updated_at}
              </p>
            </div>
          )}
        </div>

        {/* Section 4：底部操作栏 */}
        <div className="flex gap-3 border-t border-[#e5e7eb] px-5 py-4">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-[#1f2937] transition-colors hover:bg-zinc-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t.print}
          </button>
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a2e]/90"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {t.copy}
          </button>
        </div>
      </div>

      {toastMsg && (
        <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
      )}
    </>
  );
}

// ============================================================
// KV 行组件
// ============================================================
function KV({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[140px] shrink-0 text-xs text-[#6b7280]">{label}</span>
      {children ?? <span className="text-sm text-[#1f2937]">{value}</span>}
    </div>
  );
}
