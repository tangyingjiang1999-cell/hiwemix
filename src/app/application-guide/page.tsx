"use client";

import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/components/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import type { Guide, GuideCategory } from "@/types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

function GuideContent({ guide }: { guide: Guide }) {
  const { lang } = useLang();
  const content = lang === "zh" ? guide.contentZh : guide.content;
  const lines = content.split("\n");

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {lang === "zh" ? guide.titleZh : guide.title}
      </Typography>
      <Box>
        {lines.map((line, index) => {
          if (line.endsWith(":") && !line.startsWith(" ")) {
            return (
              <Typography key={index} variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                {line}
              </Typography>
            );
          }
          if (line.match(/^\d+\./)) {
            return (
              <Box key={index} sx={{ ml: 2 }}>
                <Typography variant="body2">{line}</Typography>
              </Box>
            );
          }
          if (line.trim() === "") return <br key={index} />;
          return (
            <Typography key={index} variant="body2" sx={{ lineHeight: 1.7 }}>
              {line}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}

export default function ApplicationGuidePage() {
  const { t, lang } = useLang();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    fetch("/api/guides")
      .then((r) => r.ok ? r.json() : { categories: [], guides: [] })
      .then((d: { categories: GuideCategory[]; guides: Guide[] }) => { setCategories(d.categories ?? []); setGuides(d.guides ?? []); })
      .catch(() => { setCategories([]); setGuides([]); });
  }, []);

  const filteredGuides = useMemo(() => {
    let r = guides;
    if (selectedCategory) r = r.filter((g) => g.categoryId === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((g) => {
        const t = lang === "zh" ? g.titleZh : g.title;
        const c = lang === "zh" ? g.contentZh : g.content;
        return t.toLowerCase().includes(q) || c.toLowerCase().includes(q);
      });
    }
    return r;
  }, [guides, selectedCategory, searchQuery, lang]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default", overflowX: "clip" }}>
      <SiteHeader />

      <Box sx={{ bgcolor: "#fff", pt: { xs: 9, md: 10 }, pb: { xs: 1.5, md: 2 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.guideSearchPlaceholder}
          size="small"
          fullWidth
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: { xs: "12px", md: 0 } } }}
        />
      </Box>

      <Box sx={{ display: "flex", flex: 1, flexDirection: { xs: "column", lg: "row" }, overflow: { xs: "auto", lg: "hidden" } }}>
        {/* 左栏：分类 */}
        <Box sx={{ width: { lg: 256 }, flexShrink: 0, bgcolor: "#fff", borderRight: { lg: 1 }, borderBottom: { xs: 1, lg: 0 }, borderColor: "divider", p: { xs: 1.5, md: 2 }, maxHeight: { xs: 200, lg: "none" }, overflow: { xs: "auto", lg: "visible" } }}>
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 600, px: 1 }}>{t.guideCategories}</Typography>
          <List dense>
            <ListItemButton selected={selectedCategory === ""} onClick={() => setSelectedCategory("")}
              sx={{ borderRadius: { xs: "10px", md: 0 }, minHeight: { xs: 36, md: "auto" }, "&.Mui-selected": { bgcolor: "rgba(36,135,202,0.08)", color: "primary.main" } }}>
              <ListItemText primary={t.guideAllCategories} slotProps={{ primary: { sx: { fontSize: "0.8125rem" } } }} />
            </ListItemButton>
            {categories.map((cat) => (
              <ListItemButton key={cat.id} selected={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)}
                sx={{ borderRadius: { xs: "10px", md: 0 }, minHeight: { xs: 36, md: "auto" }, "&.Mui-selected": { bgcolor: "rgba(36,135,202,0.08)", color: "primary.main" } }}>
                <ListItemText primary={lang === "zh" ? cat.nameZh : cat.name} slotProps={{ primary: { sx: { fontSize: "0.8125rem" } } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* 中栏：指南列表 */}
        <Box sx={{ width: { lg: 320 }, flexShrink: 0, bgcolor: "grey.50", borderRight: { lg: 1 }, borderBottom: { xs: 1, lg: 0 }, borderColor: "divider", p: { xs: 1.5, md: 2 }, maxHeight: { xs: 280, lg: "none" }, overflow: { xs: "auto", lg: "visible" } }}>
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 600, px: 1 }}>
            {t.guideListLabel} ({filteredGuides.length})
          </Typography>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredGuides.map((guide) => (
              <Card
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                sx={{
                  cursor: "pointer",
                  borderRadius: { xs: "12px", md: 0 },
                  borderColor: selectedGuide?.id === guide.id ? "primary.main" : "grey.200",
                  boxShadow: selectedGuide?.id === guide.id ? 1 : 0,
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: "0.8125rem", md: "0.875rem" } }}>
                    {lang === "zh" ? guide.titleZh : guide.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                    {categories.find((c) => c.id === guide.categoryId)?.[lang === "zh" ? "nameZh" : "name"] || guide.categoryId}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* 右栏：内容 */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, minHeight: { xs: 320, lg: "auto" } }}>
          {selectedGuide ? (
            <GuideContent guide={selectedGuide} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 256 }}>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>{t.guideSelectHint}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
