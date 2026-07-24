"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Globe, MessageCircle, Share2, Camera } from "lucide-react";

/* Footer — 3 种模式的 CSS 变量驱动 */
export default function Footer({ isLightBackground = false }: { isLightBackground?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // 计算 footer 主题变量
  const footerIconColor = isLightBackground
    ? "#2487ca"
    : isHome
      ? "rgba(255,255,255,0.7)"
      : "#2487ca";
  const footerIconHover = isLightBackground
    ? "#1d6fb0"
    : isHome
      ? "#ffffff"
      : "#1d6fb0";
  const footerLogoFilter = isLightBackground
    ? "none"
    : isHome
      ? "brightness(0) invert(1)"
      : "none";

  return (
    <footer
      className="relative z-10 border-t py-3 md:py-2 mt-[50px] transition-all duration-[1.5s] ease-in-out"
      style={{
        backgroundColor: isHome ? "transparent" : "#ffffff",
        borderColor: isHome ? "transparent" : "var(--border)",
      }}
    >
      <div className="flex items-center justify-center gap-8 md:gap-10">
        <Image
          src="/hiwe.png"
          alt="HIWE"
          width={1206}
          height={334}
          className="h-4 w-auto object-contain transition-all duration-[1.5s] ease-in-out"
          style={{ filter: footerLogoFilter }}
        />

        <div className="flex items-center gap-1">
          {[
            { href: "https://www.hiwe.com", label: "Website", Icon: Globe },
            { href: "https://api.whatsapp.com/send?phone=8615819205996", label: "WhatsApp", Icon: MessageCircle },
            { href: "https://www.facebook.com/profile.php?id=61550592422623", label: "Facebook", Icon: Share2 },
            { href: "https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1", label: "Instagram", Icon: Camera },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="footer-icon-link inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[1.5s] ease-in-out"
              style={{ color: footerIconColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = footerIconHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = footerIconColor)}
            >
              <Icon className="size-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
