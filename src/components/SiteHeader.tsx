"use client";

import Link from "next/link";
import Image from "next/image";
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
      sx={{
        bgcolor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: 1,
        borderColor: "divider",
        zIndex: 1100,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          pl: "20px",
          pr: "20px",
          minHeight: 64,
          gap: 4,
        }}
      >
        {/* 左侧组：Logo + 中间 3 个 nav 链接 */}
        <Stack direction="row" spacing={4} sx={{ flex: 1, alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", flexShrink: 0 }}>
            <Image
              src="/hiwemix2-01.png"
              alt="HIWE MIX"
              width={1893}
              height={334}
              style={{
                height: 32,
                width: "auto",
                objectFit: "contain",
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
                  sx={{
                    color: active ? "primary.main" : "text.secondary",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.875rem",
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

        {/* 右侧 actions */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {authUser ? (
            <>
              {authUser.role === "admin" && (
                <Button
                  component={Link}
                  href="/admin/data"
                  variant="contained"
                  color="inherit"
                  size="small"
                  sx={{
                    bgcolor: "#171717",
                    color: "#fff",
                    transition: "transform 0.1s, background-color 0.15s",
                    "&:hover": { bgcolor: "#404040", color: "#fff" },
                    "&:active": { transform: "scale(0.8)" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {t.navAdmin}
                </Button>
              )}
              {authUser.role === "admin" && (
                <Button
                  component={Link}
                  href="/admin/users"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    maxWidth: { xs: 80, md: "none" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {authUser.username}
                </Button>
              )}
              <Button
                onClick={logout}
                variant="contained"
                size="small"
                sx={{ textTransform: "none", fontWeight: 600 }}
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
              sx={{ textTransform: "none", fontWeight: 600 }}
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
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Stack>
      </Toolbar>

      {/* 移动端导航菜单 */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          root: { keepMounted: true },
          paper: { sx: { mt: 8, borderTop: 1, borderColor: "divider" } },
        }}
      >
        <Box sx={{ width: "auto" }} role="presentation">
          <List>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    selected={active}
                    sx={{
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: "rgba(13,148,136,0.08)",
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
          <Divider />
        </Box>
      </Drawer>
    </AppBar>
  );
}
