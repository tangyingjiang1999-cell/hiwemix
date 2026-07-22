"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { COLOR_TYPE_OPTIONS } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import type { CarMake, SearchParams, AppSettings } from "@/types";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  onFocusCapture?: () => void;
  onBlurCapture?: () => void;
}

export default function SearchPanel({ onSearch, isLoading, onSubmitRef, onFocusCapture, onBlurCapture }: SearchPanelProps) {
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

  // Fetch brands
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: CarMake[]) => setCarMakes(d))
      .catch(() => setCarMakes([]));
  }, []);

  // Fetch settings (color types)
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AppSettings | null) => {
        if (data?.finishes?.length) {
          setColorTypeOptions([
            { value: "", label: t.colorTypeAll },
            ...data.finishes.map((f: string) => ({ value: f.toLowerCase(), label: f })),
          ]);
        }
      })
      .catch(() => {});
  }, [t.colorTypeAll]);

  const isCodeTooLong = colorCode.replace(/\s/g, "").length > 10;

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();
      const params: SearchParams = {};
      if (makeId) params.make_id = makeId;
      if (colorCode.trim()) params.color_code = colorCode.replace(/\s/g, "");
      if (colorName.trim()) params.color_name = colorName.trim();
      if (colorType) params.color_type = colorType;
      if (year.trim()) params.year = year.trim();
      onSearch(params);
    },
    [makeId, colorCode, colorName, colorType, year, onSearch]
  );

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => handleSubmit();
    }
    return () => {
      if (onSubmitRef) onSubmitRef.current = null;
    };
  }, [onSubmitRef, handleSubmit]);

  function handleReset() {
    setMakeId("");
    setColorCode("");
    setColorName("");
    setColorType("");
    setYear("");
  }

  // 共用的输入框样式
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "transparent",
    },
  };

  return (
    <Box component="form" role="search" aria-label={t.search} onSubmit={(e) => handleSubmit(e)} onFocus={onFocusCapture} onBlur={onBlurCapture}>
      {/* 2×3 网格布局 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 2,
          width: "100%",
        }}
      >
        {/* 第一行：Make | Color Code | Color Type */}
        <TextField
          select
          label={t.make}
          value={makeId}
          onChange={(e) => setMakeId(e.target.value)}
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          <MenuItem value="">All</MenuItem>
          {carMakes.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={t.colorCode}
          value={colorCode}
          onChange={(e) => setColorCode(e.target.value.replace(/\s/g, "").toUpperCase())}
          placeholder={t.colorCodePlaceholder}
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{ htmlInput: { maxLength: 20 } }}
        />

        <TextField
          select
          label={t.colorType}
          value={colorType}
          onChange={(e) => setColorType(e.target.value)}
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        >
          {colorTypeOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        {/* 第二行：Color Name | Year | Search + Reset */}
        <TextField
          label={t.colorName}
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder={t.colorNamePlaceholder}
          size="small"
          fullWidth
          sx={inputSx}
        />

        <TextField
          label={t.year}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t.yearPlaceholder}
          size="small"
          fullWidth
          sx={inputSx}
          slotProps={{ htmlInput: { maxLength: 9 } }}
        />

        {/* 按钮组，放在网格最后一个单元格 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            type="submit"
            disabled={isLoading}
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{
              fontWeight: 600,
              fontSize: "0.8125rem",
              py: 0.75,
              minHeight: 36,
              flex: 1,
              bgcolor: "transparent",
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                bgcolor: "rgba(36,135,202,0.08)",
                borderColor: "primary.main",
              },
            }}
          >
            {isLoading ? t.searching : t.search}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            variant="outlined"
            startIcon={<RestartAltIcon />}
            sx={{
              fontWeight: 600,
              fontSize: "0.8125rem",
              py: 0.75,
              minHeight: 36,
              flex: 1,
              bgcolor: "transparent",
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                bgcolor: "rgba(36,135,202,0.08)",
                borderColor: "primary.main",
              },
            }}
          >
            {t.reset}
          </Button>
        </Box>
      </Box>

      {isCodeTooLong && (
        <Box role="alert" sx={{ mt: 1, fontSize: "0.75rem", fontWeight: 500, color: "warning.main" }}>
          {t.codeTooLong}
        </Box>
      )}
    </Box>
  );
}
