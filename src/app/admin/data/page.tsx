"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/components/AuthContext";
import BrandsPanel from "./components/BrandsPanel";
import ColorsPanel from "./components/ColorsPanel";
import VariantsPanel from "./components/VariantsPanel";
import FormulasPanel from "./components/FormulasPanel";
import GuidesPanel from "./components/GuidesPanel";
import SettingsPanel from "./components/SettingsPanel";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import PaletteIcon from "@mui/icons-material/Palette";
import GridViewIcon from "@mui/icons-material/GridView";
import ScienceIcon from "@mui/icons-material/Science";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SettingsIcon from "@mui/icons-material/Settings";

const DRAWER_WIDTH = 224;

const TABS = [
  { key: "brands", label: "品牌", icon: <BarChartIcon /> },
  { key: "colors", label: "颜色", icon: <PaletteIcon /> },
  { key: "variants", label: "施工工艺", icon: <GridViewIcon /> },
  { key: "formulas", label: "配方", icon: <ScienceIcon /> },
  { key: "guides", label: "指南", icon: <MenuBookIcon /> },
  { key: "settings", label: "设置", icon: <SettingsIcon /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DataManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("brands");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => { setMobileNavOpen(false); }, [activeTab]);

  if (loading || !user || user.role !== "admin") {
    return <Box sx={{ p: 4, textAlign: "center" }}><Typography variant="body2" color="text.secondary">加载中...</Typography></Box>;
  }

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  const navContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="overline" sx={{ px: 1, pb: 1, color: "text.disabled", fontWeight: 500, letterSpacing: 1 }}>
        Data Management
      </Typography>
      <List dense>
        {TABS.map((tab) => (
          <ListItemButton
            key={tab.key}
            selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              borderRadius: 1,
              mb: 0.25,
              "&.Mui-selected": {
                bgcolor: "#1a1a1a",
                color: "#FFFFFF",
                "& .MuiListItemIcon-root": { color: "#FFFFFF" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: activeTab === tab.key ? "#FFFFFF" : "text.disabled" }}>
              {tab.icon}
            </ListItemIcon>
            <ListItemText
              primary={tab.label}
              slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SiteHeader />

      {/* 移动端汉堡按钮 */}
      <IconButton
        onClick={() => setMobileNavOpen((v) => !v)}
        sx={{
          position: "fixed", left: 16, top: 80, zIndex: 1250,
          bgcolor: "#fff", border: 1, borderColor: "divider", boxShadow: 1,
          display: { md: "none" },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ display: "flex", pt: 8 }}>
        {/* 桌面端永久抽屉 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              top: 64,
              height: "calc(100vh - 64px)",
              borderRight: 1,
              borderColor: "divider",
              bgcolor: "grey.50",
            },
          }}
          open
        >
          {navContent}
        </Drawer>

        {/* 移动端临时抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          sx={{ display: { xs: "block", md: "none" } }}
          slotProps={{ paper: { sx: { width: DRAWER_WIDTH, pt: 8 } } }}
        >
          {navContent}
        </Drawer>

        {/* 右侧主区 */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: "calc(100vh - 64px)",
            overflow: "auto",
            px: { xs: 2, sm: 3 },
            py: 3,
          }}
        >
          <Breadcrumbs separator="/" sx={{ mb: 3, fontSize: "0.8125rem" }}>
            <Link underline="hover" color="text.disabled">Data Management</Link>
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>{activeLabel}</Typography>
          </Breadcrumbs>

          {activeTab === "brands" && <BrandsPanel />}
          {activeTab === "colors" && <ColorsPanel />}
          {activeTab === "variants" && <VariantsPanel />}
          {activeTab === "formulas" && <FormulasPanel />}
          {activeTab === "guides" && <GuidesPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </Box>
      </Box>
    </Box>
  );
}
