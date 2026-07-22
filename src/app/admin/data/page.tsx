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

const DRAWER_WIDTH = 224;

const TABS = [
  { key: "brands", label: "品牌", icon: <BarChartIcon /> },
  { key: "colors", label: "颜色", icon: <PaletteIcon /> },
  { key: "variants", label: "配方类型", icon: <GridViewIcon /> },
  { key: "formulas", label: "配方", icon: <ScienceIcon /> },
  { key: "guides", label: "指南", icon: <MenuBookIcon /> },
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
    <Box component="nav" aria-label="Data management" sx={{ p: 0 }}>
      <List dense aria-label="Data management navigation" sx={{ p: 0 }}>
        {TABS.map((tab) => (
          <ListItemButton
            key={tab.key}
            selected={activeTab === tab.key}
            aria-current={activeTab === tab.key ? "page" : undefined}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              borderRadius: "4px",
              mb: 0.25,
              mx: 0,
              pl: 1,
              pr: 1.5,
              py: 0.75,
              position: "relative",
              // 选中态：左侧指示线 + 浅蓝背景微圆角
              "&.Mui-selected": {
                bgcolor: "rgba(36,135,202,0.08)",
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
                // 左侧 3px 指示线
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: "60%",
                  borderRadius: "0 2px 2px 0",
                  bgcolor: "primary.main",
                },
              },
              // 未选中 hover
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.03)",
                color: "text.primary",
                "& .MuiListItemIcon-root": { color: "text.secondary" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "text.disabled" }}>
              {tab.icon}
            </ListItemIcon>
            <ListItemText
              primary={tab.label}
              slotProps={{ primary: { sx: { fontSize: "0.8125rem", fontWeight: activeTab === tab.key ? 600 : 400 } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", overflowX: "clip" }}>
      <SiteHeader />

      {/* 移动端汉堡按钮（Drawer 打开时隐藏；放在左下角避开顶部 Navbar） */}
      <IconButton
        onClick={() => setMobileNavOpen((v) => !v)}
        aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
        sx={{
          position: "fixed", right: { xs: 16, sm: 24 }, top: { xs: 72, sm: 76 }, zIndex: 1250,
          bgcolor: "#fff", border: 1, borderColor: "divider", boxShadow: 1,
          display: { xs: mobileNavOpen ? "none" : "inline-flex", md: "none" },
          minWidth: 36,
          minHeight: 36,
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
              bgcolor: "transparent",
              // SideNav 左侧 padding 与 Header Logo 严格对齐：px 与 Toolbar 一致
              pl: { xs: 1.5, sm: 3, md: "60px" },
              pr: 2,
              // 与右侧内容区 py 完全一致（md: 3 = 24px），确保首个菜单项与面包屑水平对齐
              pt: { xs: 2, md: 3 },
              pb: 0,
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
          slotProps={{ paper: { sx: { width: DRAWER_WIDTH, pt: 1 } } }}
        >
          {navContent}
        </Drawer>

        {/* 右侧主区 —— px 与 Header 严格一致，确保内容边缘对齐 */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: "calc(100vh - 64px)",
            overflow: "auto",
            px: { xs: 1.5, sm: 3, md: "60px" },
            py: { xs: 2, md: 3 },
          }}
        >
          <Breadcrumbs separator="/" aria-label="Breadcrumb" sx={{ mb: { xs: 2, md: 3 }, fontSize: "0.8125rem" }}>
            <Link underline="hover" color="text.disabled">Data Management</Link>
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>{activeLabel}</Typography>
          </Breadcrumbs>

          {activeTab === "brands" && <BrandsPanel />}
          {activeTab === "colors" && <ColorsPanel />}
          {activeTab === "variants" && <VariantsPanel />}
          {activeTab === "formulas" && <FormulasPanel />}
          {activeTab === "guides" && <GuidesPanel />}
        </Box>
      </Box>
    </Box>
  );
}
