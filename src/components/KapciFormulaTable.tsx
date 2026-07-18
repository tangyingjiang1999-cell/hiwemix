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

// 字体大小常量（+6px）
const FONT_SIZES = {
  caption: "1.125rem",        // 18px
  body: "1.25rem",            // 20px
  small: "1.0625rem",         // 17px
  tiny: "1rem",               // 16px
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
  }, [formula.id, totalGrams]);

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
        direction="row"
        spacing={1}
        sx={{ mb: 1.5, p: 1.5, borderRadius: 1, bgcolor: "grey.50", flexWrap: "wrap", alignItems: "center" }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1, alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "14px" }}>
            {t.volume}
          </Typography>
          <TextField
            type="number"
            value={volume}
            onChange={(e) => handleVolumeChange(e.target.value)}
            size="small"
            slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            sx={{ width: 90, "& input": { textAlign: "center", fontSize: FONT_SIZES.tiny } }}
          />
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "14px" }}>×</Typography>
          <TextField
            select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            size="small"
            sx={{ width: 80, "& .MuiSelect-select": { fontSize: FONT_SIZES.tiny } }}
          >
            {UNIT_OPTIONS.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" sx={{ color: "text.secondary", ml: 1, fontSize: "14px" }}>
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

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.tonerCode}</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.tonerName}</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.weight}</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.accum}</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "#1a1a1a", fontSize: FONT_SIZES.tiny }}>{t.massTone}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formula.components.map((comp, idx) => {
              let running = 0;
              for (let i = 0; i <= idx; i++) running += weights[i] ?? 0;

              return (
                <TableRow key={`${comp.toner_code}-${idx}`}>
                  <TableCell sx={{ py: 1, fontSize: FONT_SIZES.tiny, fontFamily: "var(--font-inter), sans-serif", fontWeight: 600, color: "#1a1a1a" }}>
                    {comp.toner_code}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: FONT_SIZES.small, color: "#1a1a1a" }}>{comp.toner_name}</TableCell>
                  <TableCell sx={{ py: 1 }}>
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
                      sx={{ height: 28, width: "100%", borderRadius: 0.5, border: 1, borderColor: "grey.200" }}
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
