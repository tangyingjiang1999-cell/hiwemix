"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { TONERS, TONER_CATEGORIES } from "@/data/toners";
import type { TonerCategory } from "@/types";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const FONT = 'var(--font-inter), var(--font-noto), "Helvetica Neue", Arial, sans-serif';

// 判断颜色是否过浅（白色/接近白色），需要特殊处理边框
function isLightColor(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return false;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  // 亮度公式：越高越接近白色
  return (r * 299 + g * 587 + b * 114) / 1000 > 220;
}

function TonerCard({ code, tradeName, hex }: { code: string; tradeName: string; hex: string }) {
  const swatchStyle: React.CSSProperties = {
    backgroundColor: hex,
    backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.16) 8%, rgba(0,0,0,0.04) 18%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.28) 38%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.28) 62%, rgba(255,255,255,0.08) 72%, rgba(0,0,0,0.04) 82%, rgba(0,0,0,0.16) 92%, rgba(0,0,0,0.30) 100%)",
  };

  // 浅色色母用灰色边框，深色用自身颜色做边框
  const borderColor = isLightColor(hex) ? "#d1d5db" : hex;

  return (
    <Card sx={{
      cursor: "pointer",
      borderRadius: 0,
      boxShadow: "none",
      border: "1px solid",
      borderColor,
      transition: "all 0.2s ease",
      "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
    }}>
      <Box sx={{ height: 80, borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit" }} style={swatchStyle} />
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9375rem", color: "#111827", lineHeight: 1.3 }}>
          {code}
        </Typography>
        <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 500, fontSize: "0.75rem", color: "#9ca3af", mt: 0.5 }}>
          {tradeName}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function TonerPage() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState<TonerCategory>("2K_BASECOAT");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredToners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TONERS.filter((toner) => {
      if (toner.category !== activeCategory) return false;
      if (!q) return true;
      return toner.code.toLowerCase().includes(q) || toner.tradeName.toLowerCase().includes(q) || toner.nameZh.includes(q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <SiteHeader />

      {/* 顶部占位：为固定导航栏留出空间 */}
      <Box sx={{ height: 64 }} />

      <Box
        sx={{
          position: "sticky", top: 64, zIndex: 30, bgcolor: "#fff", borderBottom: 1, borderColor: "divider",
          px: { xs: 2, lg: 3 }, py: 1.5,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
            {TONER_CATEGORIES.map((cat) => (
              <Chip
                key={cat.key}
                label={`${cat.label} ${cat.count}`}
                onClick={() => setActiveCategory(cat.key)}
                variant={activeCategory === cat.key ? "filled" : "outlined"}
                color={activeCategory === cat.key ? "primary" : "default"}
                size="small"
                sx={{ borderRadius: "4px", fontWeight: 500 }}
              />
            ))}
          </Stack>

          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code or name..."
            size="small"
            sx={{ width: { xs: "100%", sm: 256 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
          />
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: { xs: 2, lg: 3 }, py: 3 }}>
        {filteredToners.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, color: "text.disabled" }}>
            <Typography variant="body2">No toners found</Typography>
            <Typography variant="caption" sx={{ mt: 0.5 }}>Try a different search or category</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredToners.map((toner) => (
              <Grid key={toner.code} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <TonerCard code={toner.code} tradeName={toner.tradeName} hex={toner.hex} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Footer />
    </Box>
  );
}
