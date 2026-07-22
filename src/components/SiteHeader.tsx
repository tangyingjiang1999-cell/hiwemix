"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/components/AuthContext";
import { useLang } from "@/components/LanguageContext";

export default function SiteHeader() {
  const { user: authUser, logout } = useAuth();
  const { t } = useLang();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 顶部导航链接，与 Logo 同行水平对齐
  const navItems: { label: string; href: string }[] = [
    { label: t.navFormulaSearch, href: "/" },
    { label: t.navColorLibrary, href: "/color-library" },
    { label: t.navAppGuide, href: "/application-guide" },
  ];

  const isActive = (href: string) =>
    (href === "/" && pathname === "/") ||
    (href !== "/" && pathname?.startsWith(href));

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        zIndex: 1100,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          pl: { xs: 1.5, sm: 3, md: "60px" },
          pr: { xs: 1.5, sm: 3, md: "60px" },
          minHeight: 64,
          gap: { xs: 1, md: 4 },
        }}
      >
        {/* 左侧组：Logo + 中间 3 个 nav 链接 */}
        <Stack direction="row" spacing={4} sx={{ flex: 1, alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", flexShrink: 0 }}>
            <Box
              component="img"
              src="/hiwemix2-01.png"
              alt="HIWE MIX"
              sx={{
                height: { xs: 19, md: 32 },
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Link>

          {/* 中间导航链接 - 桌面端 */}
          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.href}
                  disableElevation
                  aria-current={active ? "page" : undefined}
                  sx={{
                    color: active ? "primary.main" : "text.secondary",
                    fontWeight: active ? 700 : 600,
                    fontSize: "0.9375rem",
                    minWidth: "auto",
                    px: 1.5,
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Stack>

        {/* 右侧 actions：4 个元素统一高度 36px、字号 0.8125rem、居中对齐、间距 12px */}
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}>
          {authUser ? (
            <>
              {authUser.role === "admin" && (
                <Button
                  component={Link}
                  href="/admin/data"
                  variant="outlined"
                  size="small"
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    px: 1.5,
                    height: 36,
                    borderRadius: 2,
                    borderColor: "grey.300",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: "rgba(36,135,202,0.04)",
                    },
                  }}
                >
                  {t.navAdmin}
                </Button>
              )}
              {authUser.role === "admin" && (
                <Button
                  component={Link}
                  href="/admin/users"
                  variant="outlined"
                  size="small"
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    px: 1.5,
                    height: 36,
                    borderRadius: 2,
                    borderColor: "grey.300",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: "rgba(36,135,202,0.04)",
                    },
                  }}
                >
                  {authUser.username}
                </Button>
              )}
              <Button
                onClick={logout}
                variant="outlined"
                color="error"
                size="small"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  px: 1.5,
                  height: 36,
                  borderRadius: 2,
                  borderColor: "error.main",
                  color: "error.main",
                  "&:hover": {
                    bgcolor: "rgba(220,38,38,0.06)",
                    borderColor: "error.main",
                  },
                }}
              >
                {t.logout}
              </Button>
            </>
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8125rem",
                px: 1.5,
                height: 36,
              }}
            >
              {t.login}
            </Button>
          )}

          <LanguageSwitcher />

          {/* 移动端汉堡菜单按钮 */}
          <IconButton
            onClick={() => setMobileMenuOpen((o) => !o)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "primary.main",
              minWidth: 36,
              minHeight: 36,
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Stack>
      </Toolbar>

      {/* 移动端导航菜单 */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          root: { keepMounted: true },
          paper: { sx: { width: "min(80vw, 320px)", borderLeft: 1, borderColor: "divider", borderRadius: { xs: "16px 0 0 16px", md: 0 } } },
        }}
      >
        <Box sx={{ width: "auto" }} role="presentation">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Box
              component="img"
              src="/hiwemix2-01.png"
              alt="HIWE MIX"
              sx={{ height: 24, width: "auto", objectFit: "contain", display: "block" }}
            />
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ minWidth: 36, minHeight: 36 }} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ pt: 1 }} aria-label={t.navFormulaSearch}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    selected={active}
                    aria-current={active ? "page" : undefined}
                    sx={{
                      py: 1.5,
                      minHeight: 48,
                      borderRadius: { xs: "10px", md: 0 },
                      mx: { xs: 1, md: 0 },
                      "&.Mui-selected": {
                        bgcolor: "rgba(36,135,202,0.08)",
                        color: "primary.main",
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontWeight: active ? 600 : 500,
                            fontSize: "0.875rem",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          {/* 移动端：管理员快捷入口 */}
          {authUser?.role === "admin" && (
            <>
              <Divider />
              <List dense>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/admin/data" onClick={() => setMobileMenuOpen(false)}
                    sx={{ py: 1.5, minHeight: 48, mx: { xs: 1, md: 0 }, borderRadius: { xs: "10px", md: 0 }, "&:hover": { bgcolor: "rgba(36,135,202,0.06)" } }}>
                    <ListItemText primary={t.navAdmin} slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/admin/users" onClick={() => setMobileMenuOpen(false)}
                    sx={{ py: 1.5, minHeight: 48, mx: { xs: 1, md: 0 }, borderRadius: { xs: "10px", md: 0 }, "&:hover": { bgcolor: "rgba(36,135,202,0.06)" } }}>
                    <ListItemText primary={`${authUser.username}`} slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
          <Divider />
        </Box>
      </Drawer>
    </AppBar>
  );
}
