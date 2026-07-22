"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useLang } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const { t } = useLang();
  const { login } = useAuth();

  async function attemptLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user) login(data.user);
      router.push("/");
      return true;
    }
    setError(data.error || t.loginErrorFailed);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError(t.loginErrorEmpty);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (password.length < 8) {
          setError(t.registerErrorPassword);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t.registerErrorMismatch);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, confirmPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await attemptLogin();
        } else {
          setError(data.error || t.registerErrorFailed);
        }
      } else {
        await attemptLogin();
      }
    } catch {
      setError(isRegister ? t.registerErrorFailed : t.loginErrorNetwork);
    } finally {
      setLoading(false);
    }
  }

  const primaryColor = isRegister ? "#7C3AED" : "primary.main";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: { xs: "column", lg: "row" }, alignItems: { xs: "center", lg: "stretch" }, overflowX: "clip" }}>
      {/* ===== 左侧渐变区 (40%) — 桌面端保留，移动端完全隐藏 ===== */}
      <Box
        className="fluid-gradient"
        sx={{
          position: "relative",
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          px: { xs: 2.5, sm: 3, lg: 5 },
          py: { xs: 3, sm: 4, lg: 6 },
          width: { lg: "40%" },
          minHeight: { xs: 160, lg: "auto" },
        }}
      >
        <Box className="fluid-blob" />

        {/* Logo - 移动端 */}
        <Box sx={{ position: "relative", zIndex: 10, display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.5 }}>
          <Image
            src="/hiwe.png"
            alt="HIWE"
            width={1206}
            height={334}
            style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
        </Box>

        {/* 主标题 - 桌面端 */}
        <Box sx={{ position: "relative", zIndex: 10, display: { xs: "none", lg: "block" }, textAlign: "left" }}>
          <Typography
            sx={{
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontSize: { lg: 40, xl: 52 },
              fontWeight: 700,
              letterSpacing: 2,
              lineHeight: 1.1,
            }}
          >
            Welcome to
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontSize: { lg: 40, xl: 52 },
              fontWeight: 700,
              letterSpacing: 2,
              lineHeight: 1.1,
            }}
          >
            HIWEMIX
          </Typography>
        </Box>

        {/* 底部社交图标（与首页 Footer 一致） */}
        <Box sx={{ position: "relative", zIndex: 10, display: { xs: "none", lg: "flex" }, gap: 0.5, alignItems: "center" }}>
          <IconButton
            component="a"
            href="https://www.hiwe.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            sx={{ color: "#fff", "&:hover": { color: "rgba(255,255,255,0.75)" } }}
          >
            <LanguageIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://api.whatsapp.com/send?phone=8615819205996"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            sx={{ color: "#fff", "&:hover": { color: "rgba(255,255,255,0.75)" } }}
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.facebook.com/profile.php?id=61550592422623"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            sx={{ color: "#fff", "&:hover": { color: "rgba(255,255,255,0.75)" } }}
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            sx={{ color: "#fff", "&:hover": { color: "rgba(255,255,255,0.75)" } }}
          >
            <InstagramIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ===== 右侧表单区 (60%) ===== */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
          px: { xs: 2.5, sm: 3, lg: 5 },
          py: { xs: 4, lg: 0 },
        }}
      >
        {/* 注册模式返回箭头（仅图标，黑色，放大 30%，下移 10px） */}
        {isRegister && (
          <IconButton
            onClick={() => {
              setIsRegister(false);
              setError("");
              setConfirmPassword("");
            }}
            aria-label={t.backToLogin}
            sx={{
              position: "absolute",
              left: { xs: 12, lg: 36 },
              top: { xs: 26, lg: 50 },
              color: "#000000",
            }}
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
          </IconButton>
        )}

        <Box sx={{ width: "100%", maxWidth: 360 }}>
          {/* 桌面端 Logo — 左对齐，与表单输入框左边视觉对齐 */}
          <Box sx={{ mb: { xs: 5, lg: 6 }, display: { xs: "none", lg: "flex" }, justifyContent: "flex-start" }}>
            <Image
              src="/hiwe.png"
              alt="HIWE"
              width={1206}
              height={334}
              style={{ height: 56, width: "auto", objectFit: "contain" }}
            />
          </Box>

          {/* Logo 移动端 — 顶部独立元素（左对齐，与表单输入框左边对齐） */}
          <Box sx={{ mb: { xs: 5, md: 5 }, display: { xs: "flex", lg: "none" }, justifyContent: "flex-start", height: { xs: 39, md: 56 } }}>
            <Image
              src="/hiwe.png"
              alt="HIWE"
              width={1206}
              height={334}
              style={{ height: "100%", width: "auto", objectFit: "contain" }}
            />
          </Box>

          {/* 表单 */}
          <Box component="form" onSubmit={handleSubmit} aria-label={isRegister ? t.registerButton : t.loginButton} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              type="text"
              label={t.loginEmail}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.loginPlaceholderEmail}
              autoFocus
              fullWidth
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: "12px", md: 0 },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: primaryColor },
              }}
            />

            <TextField
              type={showPassword ? "text" : "password"}
              label={t.loginPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.loginPlaceholderPassword}
              fullWidth
              autoComplete={isRegister ? "new-password" : "current-password"}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: { xs: "12px", md: 0 },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: primaryColor },
              }}
            />

            {isRegister && (
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label={t.registerConfirmLabel}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.registerConfirmPlaceholder}
                fullWidth
                autoComplete="new-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: { xs: "12px", md: 0 },
                    "&.Mui-focused fieldset": { borderColor: primaryColor },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: primaryColor },
                }}
              />
            )}

            {error && (
              <Alert severity="error" role="alert" variant="outlined" sx={{ fontSize: "0.8125rem" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              variant="contained"
              fullWidth
              sx={{
                py: { xs: 1, md: 1.25 },
                borderRadius: { xs: "12px", md: 0 },
                bgcolor: primaryColor,
                "&:hover": { bgcolor: isRegister ? "#6D28D9" : "primary.dark" },
                fontSize: "0.8125rem",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : isRegister ? (
                t.registerButton
              ) : (
                t.loginButton
              )}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
              {isRegister ? (
                <Button
                  onClick={() => {
                    setIsRegister(false);
                    setError("");
                    setConfirmPassword("");
                  }}
                  sx={{
                    color: primaryColor,
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "0.8125rem",
                    "&:hover": { color: isRegister ? "#6D28D9" : "primary.dark" },
                  }}
                >
                  {t.registerLoginLink}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                  sx={{
                    color: primaryColor,
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "0.8125rem",
                    "&:hover": { color: isRegister ? "#6D28D9" : "primary.dark" },
                  }}
                >
                  {t.loginRegisterLink}
                </Button>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
