"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResult, Formula, FormulaComponent, ComponentGroup } from "@/types";
import { colorSwatchStyle } from "@/lib/utils";
import { useLang } from "@/components/LanguageContext";
import KapciFormulaTable from "./KapciFormulaTable";
import Toast from "./Toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Printer, Copy } from "lucide-react";

interface FormulaDrawerProps {
  result: SearchResult | null;
  onClose: () => void;
  initialFormulaIdx?: number;
  formulaId?: string;
  initialYear?: number;
}

function formatComponents(components: FormulaComponent[]): string[] {
  const lines: string[] = ["Toner Code  |  Toner Name       |    %  |  g/100g", "-".repeat(50)];
  for (const c of components) {
    lines.push(`${c.toner_code.padEnd(12)}|  ${c.toner_name.padEnd(17)}|  ${String(c.percentage).padStart(4)}% |  ${String(c.grams_per_100g).padStart(6)}g`);
  }
  return lines;
}

function formatFormulaAsText(result: SearchResult, activeFormula: Formula, makeName: string): string {
  const lines: string[] = [];
  lines.push("=".repeat(50));
  lines.push(`HIWE Formula - ${result.color.color_name}`);
  lines.push(`Color Code: ${result.color.color_code}`);
  lines.push(`Make: ${makeName}`);
  lines.push(`Type: ${result.color.color_type}`);
  lines.push(`Process: ${activeFormula.formula_type}`);
  lines.push(`Paint System: ${activeFormula.paint_system}`);
  lines.push(`Version: ${activeFormula.version}`);
  lines.push("-".repeat(50));

  if (activeFormula.formula_type === "Three Stages") {
    lines.push("[Pearl Paint]");
    lines.push(...formatComponents(activeFormula.components.filter((c) => c.component_group === "Pearl Paint")));
    lines.push("");
    lines.push("[Ground Paint]");
    lines.push(...formatComponents(activeFormula.components.filter((c) => c.component_group === "Ground Paint")));
  } else {
    lines.push(...formatComponents(activeFormula.components));
  }
  lines.push("-".repeat(50));
  if (activeFormula.notes) lines.push(`Notes: ${activeFormula.notes}`);
  lines.push(`Updated: ${activeFormula.updated_at}`);
  lines.push("=".repeat(50));
  return lines.join("\n");
}

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function parseHexInput(raw: string, fallback: string): string {
  const t = raw.trim();
  if (!HEX_RE.test(t)) return fallback;
  return t.startsWith("#") ? t : `#${t}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
      <span className="w-28 flex-shrink-0 text-2xs text-muted-foreground md:text-base">{label}</span>
      <span className="min-w-0 flex-1 break-words text-sm md:text-xl">{value}</span>
    </div>
  );
}

export default function FormulaDrawer({ result, onClose, initialFormulaIdx, formulaId, initialYear }: FormulaDrawerProps) {
  const { t } = useLang();
  const [activeFormulaIdx, setActiveFormulaIdx] = useState(0);
  const [brands, setBrands] = useState<{ id: string; name: string; region: string }[]>([]);
  const [hexInput, setHexInput] = useState("");
  const [activeGroup, setActiveGroup] = useState<ComponentGroup>("Pearl Paint");
  const [infoTab, setInfoTab] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.ok ? r.json() : []).then((d) => setBrands(d)).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (result) {
      if (formulaId) {
        const idx = result.formulas.findIndex((f) => f.id === formulaId);
        setActiveFormulaIdx(idx >= 0 ? idx : 0);
      } else {
        setActiveFormulaIdx(initialFormulaIdx ?? 0);
      }
      setHexInput(result.color.hex_preview);
      setActiveGroup("Pearl Paint");
      setInfoTab(0);
    }
  }, [result, initialFormulaIdx, formulaId]);

  const handleClose = useCallback(() => { onClose(); }, [onClose]);

  function handlePrint() { window.print(); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!result) return null;

  const { color, formulas } = result;
  const make = brands.find((m) => m.id === color.make_id)?.name ?? color.make_id;
  const origin = brands.find((m) => m.id === color.make_id)?.region ?? "-";
  const activeFormula = formulas[activeFormulaIdx];
  const previewColor = parseHexInput(hexInput, color.hex_preview);

  let displayedFormula: Formula | null = activeFormula ?? null;
  const isGroupedType = activeFormula?.formula_type === "Three Stages";
  if (activeFormula && isGroupedType) {
    displayedFormula = {
      ...activeFormula,
      components: activeFormula.components.filter((c) => c.component_group === activeGroup),
    };
  }

  function handleCopy() {
    if (!activeFormula) return;
    navigator.clipboard.writeText(formatFormulaAsText(result!, activeFormula, make)).then(
      () => setToastMsg(t.copySuccess),
      () => setToastMsg(t.copyFail),
    );
  }

  const currentYear = initialYear?.toString() || "-";
  const TAB_KEYS = ["info", "docs", "plastic"] as const;

  return (
    <>
      <Sheet open onOpenChange={(v) => { if (!v) handleClose(); }}>
        <SheetContent side="right" className="!fixed !inset-0 !w-screen !max-w-full !translate-x-0 !rounded-none p-0 gap-0 overflow-y-auto bg-white">
          {/* Header Bar */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-3 py-2 sm:px-4 sm:py-3">
            <div
              className="size-9 flex-shrink-0 border border-border sm:size-12"
              style={colorSwatchStyle(previewColor)}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-foreground md:text-base font-heading">{color.color_name}</h2>
              <p className="text-xs text-muted-foreground">{color.color_code}</p>
            </div>

            {/* Print + Copy buttons (移动端图标-only) */}
            <Button onClick={handlePrint} variant="outline" size="sm" className="hidden rounded-lg sm:inline-flex">
              <Printer className="size-4" />
              {t.print}
            </Button>
            <Button onClick={handlePrint} size="icon" variant="ghost" className="inline-flex sm:hidden size-9 rounded-lg text-foreground/80">
              <Printer className="size-4" />
            </Button>
            <Button onClick={handleCopy} variant="default" size="sm" className="hidden rounded-lg bg-primary sm:inline-flex">
              <Copy className="size-4" />
              {t.copy}
            </Button>
            <Button onClick={handleCopy} size="icon" className="inline-flex sm:hidden size-9 rounded-lg bg-primary text-white">
              <Copy className="size-4" />
            </Button>

            <Button onClick={handleClose} variant="ghost" size="icon" className="size-9 rounded-lg">
              <X className="size-5" />
            </Button>
          </div>

          {/* Body: 两栏布局 */}
          <div className="flex flex-col md:flex-row flex-1">
            {/* 左侧：配方详情 (~62.5%) */}
            <div className="flex-1 overflow-auto border-b border-border p-4 sm:p-5 md:flex-[62.5%] md:border-b-0 md:border-r">
              {activeFormula && displayedFormula && (
                <div>
                  {/* Version + Chips */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-2xs font-semibold text-foreground md:text-lg">
                      {t.version} {activeFormula.version}
                    </span>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      activeFormula?.paint_system === "2K"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {activeFormula?.paint_system}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {activeFormula?.formula_type ?? ""}
                    </span>
                  </div>

                  <KapciFormulaTable
                    key={`${activeFormula.id}-${activeGroup}`}
                    formula={displayedFormula}
                    activeGroup={activeGroup}
                    onGroupChange={setActiveGroup}
                    showGroupToggle={true}
                  />

                  {activeFormula.notes && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <span className="text-xs font-semibold text-amber-700">{t.notesLabel}</span>
                      <p className="mt-1 text-xs text-amber-600">{activeFormula.notes}</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t.updatedLabel} {activeFormula.updated_at}
                  </p>
                </div>
              )}
            </div>

            {/* 右侧：颜色预览+信息 (~37.5%) */}
            <div className="flex-shrink-0 overflow-auto md:flex-[37.5%]">
              {/* 颜色预览 */}
              <div className="p-4 sm:p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground md:text-base">
                  {t.colorPreview}
                </span>
                <div
                  className="mt-3 h-[60px] border border-border sm:h-[120px]"
                  style={colorSwatchStyle(previewColor)}
                />
              </div>

              <Separator />

              {/* Tab Switcher */}
              <div className="flex border-b border-border">
                {[t.tabColorInfo, t.tabColorDocs, t.tabPlasticParts].map((label, idx) => (
                  <button
                    key={label}
                    onClick={() => setInfoTab(idx)}
                    className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors md:text-sm ${
                      infoTab === idx
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="p-4 sm:p-5">
                {infoTab === 0 && (
                  <div className="flex flex-col gap-3 md:gap-5">
                    <InfoRow label={t.manufacturerLabel} value={make} />
                    <InfoRow label={t.originLabel} value={origin} />
                    <InfoRow label={t.codeLabel} value={color.color_code} />
                    <InfoRow label={t.colorName} value={color.color_name} />
                    <InfoRow label={t.carModelLabel} value={color.car_model || "-"} />
                    <InfoRow label={t.yearsLabel} value={currentYear} />
                    <InfoRow label={t.processLabel} value={activeFormula?.formula_type || "-"} />
                    <InfoRow label={t.versionLabel} value={activeFormula?.version || "-"} />
                  </div>
                )}
                {(infoTab === 1 || infoTab === 2) && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">{t.emptyState}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  );
}
