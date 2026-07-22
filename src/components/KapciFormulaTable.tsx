"use client";

import { useState, useEffect, useRef } from "react";
import type { Formula, FormulaComponent, ComponentGroup } from "@/types";
import { useLang } from "@/components/LanguageContext";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

// 字体大小常量（移动端小，桌面端 +6px）
const FONT_SIZES = {
  caption: { xs: "0.8125rem", md: "1.125rem" },
  body: { xs: "0.875rem", md: "1.25rem" },
  small: { xs: "0.75rem", md: "1.0625rem" },
  tiny: { xs: "0.6875rem", md: "1rem" },
} as const;

const UNIT_OPTIONS = ["g", "kg", "ml", "liter"] as const;
type Unit = (typeof UNIT_OPTIONS)[number];

const UNIT_MULTIPLIER: Record<Unit, number> = { g: 1, kg: 1000, ml: 1, liter: 1000 };

interface KapciFormulaTableProps {
  formula: Formula;
  activeGroup?: ComponentGroup;
  onGroupChange?: (group: ComponentGroup) => void;
  showGroupToggle?: boolean;
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

export default function KapciFormulaTable({ formula, activeGroup = "Pearl Paint", onGroupChange, showGroupToggle = false }: KapciFormulaTableProps) {
  const { t } = useLang();
  const [volume, setVolume] = useState(1);
  const [unit, setUnit] = useState<Unit>("kg");
  const [weights, setWeights] = useState<number[]>([]);
  const isManualEditRef = useRef(false);

  const totalGrams = volume * UNIT_MULTIPLIER[unit];

  useEffect(() => {
    if (isManualEditRef.current) {
      isManualEditRef.current = false;
      return;
    }
    const next = formula.components.map((c) => calcWeight(c.grams_per_100g, totalGrams));
    setWeights(next);
  }, [formula.id, formula.components, totalGrams]);

  function handleVolumeChange(raw: string) {
    const num = parsePositiveNumber(raw);
    if (num === null) return;
    isManualEditRef.current = false;
    setVolume(Math.max(0.1, Math.round(num * 10) / 10));
  }

  function handleWeightChange(idx: number, raw: string) {
    const num = parsePositiveNumber(raw);
    if (num === null) return;

    // 获取被修改色母的百分比
    const changedPercentage = formula.components[idx].grams_per_100g;
    if (changedPercentage <= 0) return;

    // 根据新的重量和百分比计算新的总量
    // newTotal = newWeight / (percentage / 100)
    const newTotalGrams = Math.round((num / changedPercentage) * 100 * 10) / 10;

    // 根据新的总量重新计算所有色母的重量
    const next = formula.components.map((c) =>
      calcWeight(c.grams_per_100g, newTotalGrams)
    );

    // 确保被修改的色母使用精确值（避免四舍五入误差）
    next[idx] = num;

    // 使用ref同步标记，防止useEffect覆盖
    isManualEditRef.current = true;
    setWeights(next);

    // 更新 Volume 以反映新的总量
    const newVolume = newTotalGrams / UNIT_MULTIPLIER[unit];
    setVolume(Math.round(newVolume * 10) / 10);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: 1.5, p: { xs: 1, sm: 1.5 }, borderRadius: 0, bgcolor: "grey.50", flexWrap: "wrap", alignItems: { xs: "stretch", sm: "center" }, gap: 1 }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1, alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
            {t.volume}
          </Typography>
          <TextField
            type="number"
            value={volume}
            onChange={(e) => handleVolumeChange(e.target.value)}
            size="small"
            slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            sx={{ width: { xs: 72, md: 90 }, "& input": { textAlign: "center", fontSize: FONT_SIZES.tiny } }}
          />
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>×</Typography>
          <TextField
            select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            size="small"
            sx={{ width: { xs: 64, md: 80 }, "& .MuiSelect-select": { fontSize: FONT_SIZES.tiny } }}
          >
            {UNIT_OPTIONS.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" sx={{ color: "text.secondary", ml: { sm: 1 }, fontSize: { xs: "0.75rem", md: "0.875rem" }, width: { xs: "100%", sm: "auto" } }}>
            = {totalGrams.toLocaleString()} g total
          </Typography>
        </Box>

        {/* Pearl Paint/Ground Paint 切换按钮（兼容旧数据 "Pearl Paint"） */}
        {showGroupToggle && (formula.formula_type === "Three Stages" || (formula.formula_type as string) === "Pearl Paint") && (
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {(["Pearl Paint", "Ground Paint"] as ComponentGroup[]).map((g) => (
              <Chip
                key={g}
                label={g === "Pearl Paint" ? t.pearlPaintLabel : t.groundPaintLabel}
                onClick={() => onGroupChange?.(g)}
                variant={activeGroup === g ? "filled" : "outlined"}
                color={activeGroup === g ? "primary" : "default"}
                size="small"
              />
            ))}
          </Stack>
        )}
      </Stack>

      <TableContainer component={Paper} variant="outlined" className="table-responsive-scroll">
        <Table size="small" sx={{ minWidth: 520 }}>
          <caption className="sr-only">Formula components and weights</caption>
          <TableHead>
            <TableRow>
              <TableCell scope="col" sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.tonerCode}</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.tonerName}</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.weight}</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.accum}</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.massTone}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formula.components.map((comp, idx) => {
              let running = 0;
              for (let i = 0; i <= idx; i++) running += weights[i] ?? 0;

              return (
                <TableRow key={`${comp.toner_code}-${idx}`}>
                  <TableCell sx={{ py: 1, fontSize: FONT_SIZES.tiny, fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap" }}>
                    {comp.toner_code}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: FONT_SIZES.small, color: "#1a1a1a" }}>{comp.toner_name}</TableCell>
                  <TableCell sx={{ py: 1, minWidth: 88 }}>
                    <TextField
                      type="number"
                      value={weights[idx] ?? ""}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      size="small"
                      slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                      sx={{ width: "100%", "& input": { fontSize: FONT_SIZES.small, py: 0.5, color: "#1a1a1a" } }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontVariantNumeric: "tabular-nums", fontWeight: 500, fontSize: FONT_SIZES.small, color: "#1a1a1a" }}>
                    {running.toFixed(1)}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Box
                      role="img"
                      aria-label={`${comp.toner_name} ${t.massTone}`}
                      sx={{ height: { xs: 24, md: 28 }, width: "100%", minWidth: 60, borderRadius: 0, border: 1, borderColor: "grey.200" }}
                      style={{ backgroundColor: massToneColor(comp) }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ "& td": { fontWeight: 700, fontSize: FONT_SIZES.small, bgcolor: "grey.50", color: "#1a1a1a" } }}>
              <TableCell colSpan={5}>
                <Box component="span">{t.totalWeightLabel}</Box>
                <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  &nbsp;&nbsp;&nbsp;{totalWeight.toFixed(1)} g
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
