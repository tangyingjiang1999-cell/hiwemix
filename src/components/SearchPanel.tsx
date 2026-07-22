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

  const labelMap: Record<string, string> = {
    "": t.colorTypeAll,
    solid: t.colorTypeSolid,
    metallic: t.colorTypeMetallic,
    pearl: t.colorTypePearl,
    matte: t.colorTypeMatte,
    candy: t.colorTypeCandy,
  };

  return (
    <Box component="form" role="search" aria-label={t.search} onSubmit={(e) => handleSubmit(e)} onFocus={onFocusCapture} onBlur={onBlurCapture}>
      {/* === 外层：输入框 + 右侧列（chips + Search/Reset） === */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { md: "flex-start" },
        }}
      >
        {/* === 左：搜索条件 2×2 网格 === */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, flex: 1, width: "100%" }}>
          {/* Make select */}
          <TextField
            select
            label={t.make}
            value={makeId}
            onChange={(e) => setMakeId(e.target.value)}
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: "12px", md: 0 } } }}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="">All</MenuItem>
            {carMakes.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Color code */}
          <TextField
            label={t.colorCode}
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value.replace(/\s/g, "").toUpperCase())}
            placeholder={t.colorCodePlaceholder}
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: "12px", md: 0 } } }}
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />

          {/* Color name */}
          <TextField
            label={t.colorName}
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder={t.colorNamePlaceholder}
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: "12px", md: 0 } } }}
          />

          {/* Year */}
          <TextField
            label={t.year}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t.yearPlaceholder}
            size="small"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: "12px", md: 0 } } }}
            slotProps={{ htmlInput: { maxLength: 9 } }}
          />
        </Box>

        {/* === 右：chips + 按钮组（同一垂直列） === */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "column" },
            gap: { xs: 2, md: 1.5 },
            width: { xs: "100%", md: "auto" },
            flexShrink: 0,
            alignSelf: { md: "stretch" },
          }}
        >
          {/* chips 行：桌面端在右 / 移动端在按钮上方 */}
          <Box role="radiogroup" aria-label={t.colorType} sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.75, md: 0.75 }, justifyContent: { md: "flex-end" } }}>
            {colorTypeOptions.map((opt) => {
              const isSelected = colorType === opt.value;
              return (
                <Chip
                  key={opt.value}
                  label={labelMap[opt.value] ?? opt.label}
                  onClick={() => setColorType(opt.value)}
                  role="radio"
                  aria-checked={isSelected}
                  variant={isSelected ? "filled" : "outlined"}
                  color={isSelected ? "primary" : "default"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", md: "0.8125rem" },
                    borderRadius: { xs: "12px", md: 0 },
                    height: { xs: 30, md: 28 },
                    px: 0.5,
                    ...(isSelected ? {} : { borderColor: "grey.300", color: "text.secondary" }),
                  }}
                />
              );
            })}
          </Box>

          {/* Search / Reset 按钮组：桌面端在 chips 下方 / 移动端在 chips 下方 */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, md: 1 },
              flexDirection: "row",
              width: { xs: "100%", md: "auto" },
              justifyContent: { md: "flex-end" },
            }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{
                borderRadius: { xs: "12px", md: 0 },
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.8125rem", md: "0.8125rem" },
                py: { xs: 0.75, md: 0.75 },
                minHeight: { xs: 36, md: "auto" },
                flex: { xs: 1, md: "0 0 auto" },
                minWidth: { xs: 0, md: 96 },
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
                borderRadius: { xs: "12px", md: 0 },
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.8125rem", md: "0.8125rem" },
                color: "text.secondary",
                borderColor: "grey.300",
                py: { xs: 0.75, md: 0.75 },
                minHeight: { xs: 36, md: "auto" },
                flex: { xs: 1, md: "0 0 auto" },
                minWidth: { xs: 0, md: 96 },
              }}
            >
              {t.reset}
            </Button>
          </Box>
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
