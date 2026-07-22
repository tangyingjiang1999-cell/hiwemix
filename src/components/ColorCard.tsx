"use client";

import { memo } from "react";
import type { SearchResult } from "@/types";
import { COLOR_TYPE_MAP } from "@/lib/constants";
import { useLang } from "@/components/LanguageContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ColorCardProps {
  result: SearchResult;
  onOpenDetail: (result: SearchResult) => void;
}

const ColorCard = memo(function ColorCard({
  result,
  onOpenDetail,
}: ColorCardProps) {
  const { color, formulas } = result;
  const { t } = useLang();

  const typeInfo = COLOR_TYPE_MAP[color.color_type] ?? {
    label: color.color_type,
    badge: "bg-zinc-100 text-zinc-600",
  };
  const typeLabelMap: Record<string, string> = {
    solid: t.colorTypeSolidLabel, metallic: t.colorTypeMetallicLabel,
    pearl: t.colorTypePearlLabel, matte: t.colorTypeMatteLabel,
    candy: t.colorTypeCandyLabel, special: t.colorTypeSpecialLabel,
  };
  const typeLabel = typeLabelMap[color.color_type] ?? color.color_type;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetail(result);
    }
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(result)}
      onKeyDown={handleKeyDown}
      aria-label={`${color.color_name} — ${color.color_code}`}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        borderRadius: 0,
        border: "1px solid",
        borderColor: "grey.300",
        bgcolor: "background.paper",
        transition: "box-shadow 0.2s ease-out",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
        "&:last-of-type": {
          mb: 0,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        {/* 左侧：色块 + 颜色信息 */}
        <Box
          sx={{
            display: "flex",
            minWidth: 0,
            flex: 1,
            alignItems: "center",
            gap: 2,
            textAlign: "left",
          }}
        >
          <Box
            sx={{
              height: 40,
              width: 40,
              flexShrink: 0,
              borderRadius: 0,
              border: "1px solid",
              borderColor: "grey.300",
            }}
            style={{ backgroundColor: color.hex_preview }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {color.color_name}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.6875rem",
                color: "text.disabled",
              }}
            >
              {color.color_code}
            </Typography>
          </Box>
        </Box>

        {/* 右侧：类型标记 + 配方数 + 箭头 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={{
              flexShrink: 0,
              borderRadius: 0,
              px: 1,
              py: 0.25,
              fontSize: "0.625rem",
              fontWeight: 500,
              bgcolor: "grey.100",
              color: "text.secondary",
            }}
          >
            {typeLabel}
          </Box>

          <Typography
            sx={{
              flexShrink: 0,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            {t.formulasCount(formulas.length)}
          </Typography>

          <Box
            component="svg"
            sx={{
              height: 16,
              width: 16,
              color: "grey.400",
              flexShrink: 0,
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default ColorCard;
