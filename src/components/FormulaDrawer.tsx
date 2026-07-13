"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResult, Formula, FormulaComponent, Color, ComponentGroup } from "@/types";
import { COLOR_TYPE_MAP } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";
import KapciFormulaTable from "./KapciFormulaTable";
import Toast from "./Toast";

interface FormulaDrawerProps {
  result: SearchResult | null;
  onClose: () => void;
  initialFormulaIdx?: number;
}

function formatComponents(components: FormulaComponent[]): string[] {
  const lines: string[] = [];
  lines.push("Toner Code  |  Toner Name       |    %  |  g/100g");
  lines.push("-".repeat(50));
  for (const c of components) {
    lines.push(
      `${c.toner_code.padEnd(12)}|  ${c.toner_name.padEnd(17)}|  ${String(
        c.percentage
      ).padStart(4)}% |  ${String(c.grams_per_100g).padStart(6)}g`
    );
  }
  return lines;
}

function formatFormulaAsText(
  result: SearchResult,
  activeFormula: Formula,
  makeName: string
): string {
  const make = makeName;
  const variantName =
    result.color.variants.find((v) => v.id === activeFormula.variant_id)?.name ??
    activeFormula.variant_id;

  const lines: string[] = [];
  lines.push("=".repeat(50));
  lines.push(`HIWE Formula - ${result.color.color_name}`);
  lines.push(`Color Code: ${result.color.color_code}`);
  lines.push(`Make: ${make}`);
  lines.push(`Type: ${result.color.color_type}`);
  lines.push(`Variant: ${variantName}`);
  lines.push(`Paint System: ${activeFormula.paint_system}`);
  lines.push(`Formula Type: ${activeFormula.formula_type}`);
  lines.push(`Version: ${activeFormula.version}`);
  lines.push("-".repeat(50));

  if (activeFormula.formula_type === "Pearl Paint") {
    lines.push("[Pearl Paint]");
    lines.push(
      ...formatComponents(
        activeFormula.components.filter((c) => c.component_group === "Pearl Paint")
      )
    );
    lines.push("");
    lines.push("[Ground Paint]");
    lines.push(
      ...formatComponents(
        activeFormula.components.filter((c) => c.component_group === "Ground Paint")
      )
    );
  } else {
    lines.push(...formatComponents(activeFormula.components));
  }

  lines.push("-".repeat(50));
  if (activeFormula.notes) {
    lines.push(`Notes: ${activeFormula.notes}`);
  }
  lines.push(`Updated: ${activeFormula.updated_at}`);
  lines.push("=".repeat(50));
  return lines.join("\n");
}

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function parseHexInput(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (!HEX_RE.test(trimmed)) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function ColorPreviewPanel({
  hexInput,
  onChange,
  previewColor,
  label,
}: {
  hexInput: string;
  onChange: (val: string) => void;
  previewColor: string;
  label: string;
}) {
  const isValid = HEX_RE.test(hexInput.trim());

  return (
    <div className="p-4 sm:p-5">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </h3>
      <div
        className="h-56 w-full rounded-lg border border-[#E2E8F0] shadow-inner sm:h-80"
        style={{ backgroundColor: previewColor }}
      />
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B]">#</span>
          <input
            type="text"
            value={hexInput.replace(/^#/, "")}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "flex-1 rounded-md border bg-white px-3 py-2 text-sm uppercase text-[#0F172A] outline-none transition-colors",
              isValid
                ? "border-[#E2E8F0] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20"
                : "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
            )}
          />
        </div>
      </div>
    </div>
  );
}

function FormulaInfoTabs({
  color,
  make,
}: {
  color: Color;
  make: string;
}) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"info" | "docs" | "plastic">("info");
  const years = color.variants.map((v) => v.year_range).join(", ");

  const tabs = [
    { key: "info" as const, label: t.tabColorInfo },
    { key: "docs" as const, label: t.tabColorDocs },
    { key: "plastic" as const, label: t.tabPlasticParts },
  ];

  return (
    <div className="flex flex-col border-t border-[#E2E8F0]">
      <div className="flex border-b border-[#E2E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 px-2 py-2.5 text-center text-[11px] font-medium transition-colors sm:text-xs",
              activeTab === tab.key
                ? "border-b-2 border-[#0D9488] text-[#0D9488]"
                : "text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {activeTab === "info" && (
          <div className="space-y-3 text-sm">
            <InfoRow label={t.manufacturerLabel} value={make} />
            <InfoRow label={t.codeLabel} value={color.color_code} />
            <InfoRow label={t.colorName} value={color.color_name} />
            <InfoRow label={t.yearsLabel} value={years || "-"} />
          </div>
        )}

        {(activeTab === "docs" || activeTab === "plastic") && (
          <div className="py-6 text-center text-[11px] text-[#94A3B8]">
            {t.emptyState}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-[11px] text-[#64748B] sm:w-28">{label}</span>
      <span className="min-w-0 flex-1 text-xs text-[#0F172A]">{value}</span>
    </div>
  );
}

export default function FormulaDrawer({ result, onClose, initialFormulaIdx }: FormulaDrawerProps) {
  const { t } = useLang();
  const [activeFormulaIdx, setActiveFormulaIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [hexInput, setHexInput] = useState("");
  const [activeGroup, setActiveGroup] = useState<ComponentGroup>("Pearl Paint");

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBrands(data))
      .catch(() => setBrands([]));
  }, []);

  const typeLabelMap: Record<string, string> = {
    solid: t.colorTypeSolidLabel,
    metallic: t.colorTypeMetallicLabel,
    pearl: t.colorTypePearlLabel,
    matte: t.colorTypeMatteLabel,
    candy: t.colorTypeCandyLabel,
    special: t.colorTypeSpecialLabel,
  };

  useEffect(() => {
    if (result) {
      // result 变化时重置选中配方索引与 hex 输入
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveFormulaIdx(initialFormulaIdx ?? 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHexInput(result.color.hex_preview);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveGroup("Pearl Paint");
      requestAnimationFrame(() => setVisible(true));
      document.getElementById("page-content")?.classList.add("blur-bg");
    } else {
      setVisible(false);
      document.getElementById("page-content")?.classList.remove("blur-bg");
    }
    return () => {
      document.getElementById("page-content")?.classList.remove("blur-bg");
    };
  }, [result, initialFormulaIdx]);

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
  const typeLabel = typeLabelMap[color.color_type] ?? color.color_type;
  const make = brands.find((m) => m.id === color.make_id)?.name ?? color.make_id;
  const activeFormula = formulas[activeFormulaIdx];

  const previewColor = parseHexInput(hexInput, color.hex_preview);

  // 根据分组过滤组件（仅 Pearl Paint 使用）
  let displayedFormula: Formula | null = activeFormula ?? null;
  if (activeFormula && activeFormula.formula_type === "Pearl Paint") {
    displayedFormula = {
      ...activeFormula,
      components: activeFormula.components.filter((c) => c.component_group === activeGroup),
    };
  }

  function handleCopy() {
    if (!activeFormula) return;
    const text = formatFormulaAsText(result!, activeFormula, make);
    navigator.clipboard.writeText(text).then(
      () => setToastMsg(t.copySuccess),
      () => setToastMsg(t.copyFail)
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-200",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ zIndex: 999 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed left-1/2 top-1/2 flex flex-col overflow-hidden rounded-lg bg-white",
          "w-[95vw] max-w-[85rem] max-h-[90vh]",
          "transition-all duration-200 ease-out",
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[0.96] pointer-events-none"
        )}
        style={{
          zIndex: 1000,
          transform: visible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.96)",
          boxShadow: "0 1px 1px rgba(0,0,0,0.02), 0 8px 16px -4px rgba(0,0,0,0.04), 0 24px 32px -8px rgba(0,0,0,0.06)"
        }}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-[#E2E8F0] px-5 py-5 sm:px-8 sm:py-6">
          <div
            className="h-12 w-12 shrink-0 rounded-[6px] border border-[#E2E8F0]"
            style={{ backgroundColor: previewColor }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-[#0F172A]">
              {color.color_name}
            </h2>
            <p className="text-xs text-gray-500">{color.color_code}</p>
          </div>

          {activeFormula?.formula_type === "Pearl Paint" && (
            <div className="hidden items-center gap-1.5 sm:flex">
              {(["Pearl Paint", "Ground Paint"] as ComponentGroup[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroup(g)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    activeGroup === g
                      ? "bg-[#0D9488] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  )}
                >
                  {g === "Pearl Paint" ? t.pearlPaintLabel : t.groundPaintLabel}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:text-[#0F172A]"
            aria-label={t.close}
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

        {/* 移动端 Pearl Paint 切换（小屏幕放到内容区上方） */}
        {activeFormula?.formula_type === "Pearl Paint" && (
          <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] px-5 py-2 sm:hidden">
            {(["Pearl Paint", "Ground Paint"] as ComponentGroup[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGroup(g)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeGroup === g
                    ? "bg-[#0D9488] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                )}
              >
                {g === "Pearl Paint" ? t.pearlPaintLabel : t.groundPaintLabel}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* 左侧：配方表 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-b border-[#E2E8F0] px-5 py-5 sm:px-10 sm:py-8 lg:border-b-0 lg:border-r">
            {formulas.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
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
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all duration-200 ease-out",
                        isActive
                          ? "bg-[#0D9488] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                      )}
                    >
                      {variantName}
                    </button>
                  );
                })}
              </div>
            )}

            {activeFormula && displayedFormula && (
              <div className="animate-[fadeIn_150ms_ease-in-out]">
                <div className="mb-3 flex items-center gap-2 text-[11px] text-[#6B7280]">
                  <span>
                    {t.version} {activeFormula.version}
                  </span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-px text-[10px] font-semibold",
                      activeFormula.paint_system === "2K"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {activeFormula.paint_system}
                  </span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="rounded bg-gray-100 px-1.5 py-px text-[10px] font-semibold text-gray-700">
                    {activeFormula.formula_type}
                  </span>
                </div>

                <KapciFormulaTable
                  key={`${activeFormula.id}-${activeGroup}`}
                  formula={displayedFormula}
                />

                {activeFormula.notes && (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3">
                    <p className="text-[11px] font-semibold text-amber-800">
                      {t.notesLabel}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-700">
                      {activeFormula.notes}
                    </p>
                  </div>
                )}

                <p className="mt-3 text-[11px] text-[#9CA3AF]">
                  {t.updatedLabel} {activeFormula.updated_at}
                </p>
              </div>
            )}
          </div>

          {/* 右侧：颜色预览与信息 */}
          <div className="flex w-full shrink-0 flex-col overflow-y-auto lg:w-[420px]">
            <ColorPreviewPanel
              hexInput={hexInput}
              onChange={setHexInput}
              previewColor={previewColor}
              label={t.colorPreview}
            />
            <FormulaInfoTabs color={color} make={make} />
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#e5e7eb] px-4 py-3 sm:px-5 sm:py-4">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-4 py-2.5 text-xs font-semibold text-[#1f2937] transition-colors hover:bg-zinc-50"
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
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F766E]"
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

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  );
}
