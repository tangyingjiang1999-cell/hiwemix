"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, SearchParams, AppSettings } from "@/types";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
}

export default function SearchPanel({ onSearch, isLoading, onSubmitRef }: SearchPanelProps) {
  const { t } = useLang();

  const [makeId, setMakeId] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorType, setColorType] = useState("");
  const [year, setYear] = useState("");
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [colorTypeOptions, setColorTypeOptions] = useState<{ value: string; label: string }[]>(
    COLOR_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
  );

  useEffect(() => {
    fetch("/api/brands").then((r) => r.ok ? r.json() : []).then((d: CarMake[]) => setCarMakes(d)).catch(() => setCarMakes([]));
  }, []);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.ok ? r.json() : null).then((data: AppSettings | null) => {
      if (data?.finishes?.length) {
        setColorTypeOptions([
          { value: "", label: t.colorTypeAll },
          ...data.finishes.map((f: string) => ({ value: f.toLowerCase(), label: f })),
        ]);
      }
    }).catch(() => {});
  }, [t.colorTypeAll]);

  const isCodeTooLong = colorCode.replace(/\s/g, "").length > 10;

  const handleSubmit = useCallback((e?: FormEvent) => {
    if (e) e.preventDefault();
    const params: SearchParams = {};
    if (makeId) params.make_id = makeId;
    if (colorCode.trim()) params.color_code = colorCode.replace(/\s/g, "");
    if (colorName.trim()) params.color_name = colorName.trim();
    if (colorType) params.color_type = colorType;
    if (year.trim()) params.year = year.trim();
    onSearch(params);
  }, [makeId, colorCode, colorName, colorType, year, onSearch]);

  useEffect(() => {
    if (onSubmitRef) { onSubmitRef.current = () => handleSubmit(); }
    return () => { if (onSubmitRef) onSubmitRef.current = null; };
  }, [onSubmitRef, handleSubmit]);

  function handleReset() { setMakeId(""); setColorCode(""); setColorName(""); setColorType(""); setYear(""); }

  const labelMap: Record<string, string> = {
    "": t.colorTypeAll, solid: t.colorTypeSolid, metallic: t.colorTypeMetallic,
    pearl: t.colorTypePearl, matte: t.colorTypeMatte, candy: t.colorTypeCandy,
  };

  return (
    <Box component="form" onSubmit={(e) => handleSubmit(e)}>
      {/* === 搜索条件：4 字段等宽 2×2 网格 === */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <TextField
          select
          label={t.make}
          value={makeId}
          onChange={(e) => setMakeId(e.target.value)}
          size="small"
          fullWidth
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">All</MenuItem>
          {carMakes.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
        </TextField>

        <TextField
          label={t.colorCode}
          value={colorCode}
          onChange={(e) => setColorCode(e.target.value.replace(/\s/g, "").toUpperCase())}
          placeholder={t.colorCodePlaceholder}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 20 } }}
        />

        <TextField
          label={t.colorName}
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder={t.colorNamePlaceholder}
          size="small"
          fullWidth
        />

        <TextField
          label={t.year}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t.yearPlaceholder}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 9 } }}
        />
      </Box>

      {isCodeTooLong && (
        <Box sx={{ mt: 1, fontSize: "0.75rem", fontWeight: 500, color: "warning.main" }}>
          {t.codeTooLong}
        </Box>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* === 漆面类型 + 按钮同行 === */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
        {colorTypeOptions.map((opt) => {
          const isSelected = colorType === opt.value;
          return (
            <Chip
              key={opt.value}
              label={labelMap[opt.value] ?? opt.label}
              onClick={() => setColorType(opt.value)}
              variant={isSelected ? "filled" : "outlined"}
              color={isSelected ? "primary" : "default"}
              size="medium"
              sx={{
                fontWeight: 500,
                fontSize: "0.8125rem",
                borderRadius: 1.5,
                px: 0.5,
                ...(isSelected ? {} : { borderColor: "grey.300", color: "text.secondary" }),
              }}
            />
          );
        })}
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Button
            type="submit"
            disabled={isLoading}
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120, borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: "0.875rem" }}
          >
            {isLoading ? t.searching : t.search}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outlined"
            startIcon={<RestartAltIcon />}
            sx={{ minWidth: 120, borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: "0.875rem", color: "text.secondary", borderColor: "grey.300" }}
          >
            {t.reset}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
