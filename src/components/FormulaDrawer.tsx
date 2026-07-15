"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResult, Formula, FormulaComponent, ComponentGroup, Color } from "@/types";
import { COLOR_TYPE_MAP } from "@/lib/constants";
import { colorSwatchStyle } from "@/lib/utils";
import { useLang } from "@/components/LanguageContext";
import KapciFormulaTable from "./KapciFormulaTable";
import Toast from "./Toast";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// 字体大小常量（+6px）
const FONT_SIZES = {
  caption: "1.125rem",        // 18px
  body: "1.25rem",            // 20px
  small: "1.0625rem",         // 17px
  tiny: "1rem",               // 16px
} as const;

interface FormulaDrawerProps {
  result: SearchResult | null;
  onClose: () => void;
  initialFormulaIdx?: number;
  formulaId?: string;
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
  const v = result.color.variants.find((x) => x.id === activeFormula.variant_id);
  lines.push(`Variant: ${v?.name ?? activeFormula.variant_id}`);
  lines.push(`Paint System: ${activeFormula.paint_system}`);
  lines.push(`Formula Type: ${activeFormula.formula_type}`);
  lines.push(`Version: ${activeFormula.version}`);
  lines.push("-".repeat(50));

  if (activeFormula.formula_type === "Pearl Paint") {
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

export default function FormulaDrawer({ result, onClose, initialFormulaIdx, formulaId }: FormulaDrawerProps) {
  const { t } = useLang();
  const [activeFormulaIdx, setActiveFormulaIdx] = useState(0);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [hexInput, setHexInput] = useState("");
  const [activeGroup, setActiveGroup] = useState<ComponentGroup>("Pearl Paint");
  const [infoTab, setInfoTab] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.ok ? r.json() : []).then((d) => setBrands(d)).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    if (result) {
      // 优先通过 formulaId 精确定位，否则用 initialFormulaIdx
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
  const activeFormula = formulas[activeFormulaIdx];
  const previewColor = parseHexInput(hexInput, color.hex_preview);

  let displayedFormula: Formula | null = activeFormula ?? null;
  if (activeFormula && activeFormula.formula_type === "Pearl Paint") {
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

  const years = color.years?.join(", ") || "";
  const typeLabel = color.color_type;

  return (
    <>
      <Dialog open onClose={handleClose} maxWidth={false} slotProps={{ paper: { sx: { height: "100vh", maxHeight: "100vh", width: "100vw", maxWidth: "100vw", borderRadius: 0, m: 0, p: 0 } } }}>
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Toolbar sx={{ gap: 2 }}>
            <Box
              sx={{ width: 48, height: 48, borderRadius: 1.5, border: 1, borderColor: "grey.200", flexShrink: 0 }}
              style={colorSwatchStyle(previewColor)}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{color.color_name}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{color.color_code}</Typography>
              </Box>
            </Box>

            {/* Print + Copy buttons */}
            <Button onClick={handlePrint} variant="outlined" startIcon={<PrintIcon />}
              sx={{ color: "text.primary", borderColor: "grey.300", textTransform: "none", flexShrink: 0 }}>
              {t.print}
            </Button>
            <Button onClick={handleCopy} variant="contained" startIcon={<ContentCopyIcon />}
              sx={{ textTransform: "none", flexShrink: 0 }}>
              {t.copy}
            </Button>

            <IconButton onClick={handleClose} edge="end"><CloseIcon /></IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flex: 1, flexDirection: { xs: "column", md: "row" }, overflow: "hidden", width: "100%", height: "100%" }}>

          {/* 左侧：配方详情 (~62.5% 宽度) */}
          <Box sx={{
            flex: { xs: "none", md: "1 1 62.5%" },
            overflow: "auto",
            p: { xs: 2, sm: 4 },
            borderRight: { md: 1 },
            borderBottom: { xs: 1, md: "none" },
            borderColor: "divider",
          }}>
            {activeFormula && displayedFormula && (
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "#1a1a1a", fontSize: FONT_SIZES.caption }}>
                    {t.version} {activeFormula.version}
                  </Typography>

                  <Chip label={activeFormula?.paint_system} size="small"
                    sx={{ fontWeight: 600, fontSize: "0.75rem",
                      ...(activeFormula?.paint_system === "2K" ? { bgcolor: "#DBEAFE", color: "#1D4ED8" } : { bgcolor: "#D1FAE5", color: "#047857" }) }} />
                  <Chip label={activeFormula?.formula_type} size="small"
                    sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: "#FEF3C7", color: "#92400E" }} />
                </Stack>

                <KapciFormulaTable
                  key={`${activeFormula.id}-${activeGroup}`}
                  formula={displayedFormula}
                  activeGroup={activeGroup}
                  onGroupChange={setActiveGroup}
                  showGroupToggle={true}
                />

                {activeFormula.notes && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 1, border: 1, borderColor: "#FDE68A", bgcolor: "rgba(254,243,199,0.5)" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#92400E" }}>{t.notesLabel}</Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#B45309" }}>{activeFormula.notes}</Typography>
                  </Box>
                )}
                <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "text.disabled" }}>
                  {t.updatedLabel} {activeFormula.updated_at}
                </Typography>
              </Box>
            )}
          </Box>

          {/* 右侧：颜色预览+信息 (~37.5% 宽度) */}
          <Box sx={{
            flex: { xs: "none", md: "1 1 37.5%" },
            overflow: "auto",
            flexShrink: 0,
          }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="overline" sx={{ color: "#1a1a1a", fontWeight: 600, letterSpacing: 1, fontSize: FONT_SIZES.small }}>
                {t.colorPreview}
              </Typography>
              <Box
                sx={{ mt: 1.5, height: { xs: 75, sm: 120 }, borderRadius: 1, border: 1, borderColor: "grey.200" }}
                style={colorSwatchStyle(previewColor)}
              />
            </Box>

            <Box sx={{ borderTop: 1, borderColor: "divider" }}>
              <Tabs value={infoTab} onChange={(_, v) => setInfoTab(v)} variant="fullWidth">
                <Tab label={t.tabColorInfo} />
                <Tab label={t.tabColorDocs} />
                <Tab label={t.tabPlasticParts} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {infoTab === 0 && (
                <Stack spacing={2}>
                  <InfoRow label={t.manufacturerLabel} value={make} />
                  <InfoRow label={t.codeLabel} value={color.color_code} />
                  <InfoRow label={t.colorName} value={color.color_name} />
                  <InfoRow label={t.yearsLabel} value={years || "-"} />
                </Stack>
              )}
              {(infoTab === 1 || infoTab === 2) && (
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>{t.emptyState}</Typography>
                </Box>
              )}
            </Box>
          </Box>

        </Box>
      </Dialog>

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5}>
      <Typography variant="caption" sx={{ width: 112, flexShrink: 0, color: "text.secondary" }}>{label}</Typography>
      <Typography variant="body2" sx={{ minWidth: 0, flex: 1 }}>{value}</Typography>
    </Stack>
  );
}
