"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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

  // ==================== 路由追踪与渐变动画逻辑 ====================

  // 保存上一次路由，用于判断是否跨首页导航
  const prevPathRef = useRef<string | null>(null);

  const isHome = pathname === "/";
  const prevIsHome = prevPathRef.current === "/";

  // 条件 A/B：首页 ↔ 其他页面切换 → 开启 1.5s 渐变
  // 条件 C：其他页面之间切换 → 无渐变（保持 0s 即 seamless）
  // 首次渲染时 prevPathRef 为 null，不触发过渡
  const isCrossHomeNav =
    prevPathRef.current !== null && prevIsHome !== isHome;

  // 渲染后更新上一次路由
  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  // 动态过渡样式：跨首页导航用 1.5s 缓动，其他情况禁用过渡
  const transitionStyle = isCrossHomeNav
    ? "all 1.5s ease-in-out"
    : "none";

  // === 根据是否首页计算 Header 配色与定位 ===
  // 首页：透明底浮于背景图上方 + 蓝字 + 灰边框
  // 非首页：蓝底常规流 + 白字 + 白边框
  const headerBg = isHome ? "transparent" : "#2487ca";
  const headerPosition = isHome ? "absolute" : "relative";
  const headerTextColor = isHome ? "#2487ca" : "#ffffff";
  const headerMutedColor = isHome ? "text.secondary" : "rgba(255,255,255,0.7)";
  const headerBorderColor = isHome ? "grey.300" : "rgba(255,255,255,0.3)";
  const headerHoverBg = isHome
    ? "rgba(36,135,202,0.04)"
    : "rgba(255,255,255,0.1)";

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
      position={isHome ? "absolute" : "fixed"}
      color="default"
      elevation={0}
      sx={{
        bgcolor: headerBg,
        zIndex: 1100,
        top: isHome ? 0 : undefined,
        left: isHome ? 0 : undefined,
        transition: transitionStyle,
        // 非首页时底部细线分隔
        borderBottom: isHome ? "none" : "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          pl: { xs: 1.5, sm: 3, md: "60px" },
          pr: { xs: 1.5, sm: 3, md: "60px" },
          minHeight: 64,
          position: "relative",
        }}
      >
        {/* Logo 左侧 */}
        <Link href="/" style={{ display: "flex", flexShrink: 0, zIndex: 1 }}>
          <Box
            component="img"
            src="/hiwemix2-01.png"
            alt="HIWE MIX"
            sx={{
              height: { xs: 19, md: 32 },
              width: "auto",
              objectFit: "contain",
              display: "block",
              filter: isHome ? "none" : "brightness(0) invert(1)",
              transition: transitionStyle,
            }}
          />
        </Link>

        {/* 中间导航链接 — 绝对定位水平居中 */}
        <Stack
          direction="row"
          spacing={2.5}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
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
                  color: active ? headerTextColor : headerMutedColor,
                  fontWeight: active ? 700 : 600,
                  fontSize: "0.8125rem",
                  minWidth: "auto",
                  px: 1.5,
                  transition: transitionStyle,
                  "&:hover": {
                    bgcolor: "transparent",
                    color: headerTextColor,
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        {/* 右侧 actions：吸附在最右侧 */}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, flexShrink: 0, zIndex: 1 }}>
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
                    borderColor: headerBorderColor,
                    color: headerMutedColor,
                    transition: transitionStyle,
                    "&:hover": {
                      borderColor: headerTextColor,
                      color: headerTextColor,
                      bgcolor: headerHoverBg,
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
                    borderColor: headerBorderColor,
                    color: headerMutedColor,
                    transition: transitionStyle,
                    "&:hover": {
                      borderColor: headerTextColor,
                      color: headerTextColor,
                      bgcolor: headerHoverBg,
                    },
                  }}
                >
                  {authUser.username}
                </Button>
              )}
              <Button
                onClick={logout}
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
                  borderColor: headerBorderColor,
                  color: headerMutedColor,
                  transition: transitionStyle,
                  "&:hover": {
                    borderColor: headerTextColor,
                    color: headerTextColor,
                    bgcolor: headerHoverBg,
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
                transition: transitionStyle,
              }}
            >
              {t.login}
            </Button>
          )}

          <LanguageSwitcher isHome={isHome} transitionStyle={transitionStyle} />

          {/* 移动端汉堡菜单按钮 */}
          <IconButton
            onClick={() => setMobileMenuOpen((o) => !o)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: headerTextColor,
              minWidth: 36,
              minHeight: 36,
              transition: transitionStyle,
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
