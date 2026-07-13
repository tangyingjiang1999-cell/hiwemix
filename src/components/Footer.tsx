"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
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
        bgcolor: "#171717",
        color: "#A1A1A1",
        py: 1.5,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          {/* 品牌 Logo + 社交图标 */}
          <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
            <Image
              src="/hiwe.png"
              alt="HIWE"
              width={1206}
              height={334}
              style={{
                height: 32,
                width: "auto",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
            {/* 社交媒体链接 */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <IconButton
                component="a"
                href="https://www.hiwe.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                size="small"
                sx={{ color: "#A1A1A1", "&:hover": { color: "#fff" } }}
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
                sx={{ color: "#A1A1A1", "&:hover": { color: "#fff" } }}
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
                sx={{ color: "#A1A1A1", "&:hover": { color: "#fff" } }}
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
                sx={{ color: "#A1A1A1", "&:hover": { color: "#fff" } }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
