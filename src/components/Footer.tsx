"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import LanguageIcon from "@mui/icons-material/Language";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

// 全站共享 Footer：品牌 logo + 社交链接
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        color: "primary.main",
        py: { xs: 2, md: 1.5 },
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1.5, md: 3 }}
        sx={{ alignItems: "center", justifyContent: "space-between", mx: { xs: 1.5, sm: 3, md: "60px" } }}
      >
          {/* 品牌 Logo */}
          <Image
            src="/hiwe.png"
            alt="HIWE"
            width={1206}
            height={334}
            style={{
              height: 16,
              width: "auto",
              objectFit: "contain",
            }}
          />
          {/* 社交媒体链接 */}
          <Stack direction="row" spacing={{ xs: 0.5, md: 1.5 }} sx={{ alignItems: "center" }}>
            <IconButton
              component="a"
              href="https://www.hiwe.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
              size="small"
              sx={{ color: "primary.main", minWidth: 36, minHeight: 36, "&:hover": { color: "primary.dark" } }}
            >
              <LanguageIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://api.whatsapp.com/send?phone=8615819205996"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              size="small"
              sx={{ color: "primary.main", minWidth: 36, minHeight: 36, "&:hover": { color: "primary.dark" } }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.facebook.com/profile.php?id=61550592422623"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              size="small"
              sx={{ color: "primary.main", minWidth: 36, minHeight: 36, "&:hover": { color: "primary.dark" } }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              size="small"
              sx={{ color: "primary.main", minWidth: 36, minHeight: 36, "&:hover": { color: "primary.dark" } }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
    </Box>
  );
}
