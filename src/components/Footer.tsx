"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Globe, MessageCircle, Share2, Camera } from "lucide-react";

export default function Footer({ isLightBackground = false }: { isLightBackground?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const iconColor = isLightBackground
    ? "#2487ca"
    : isHome
      ? "rgba(255,255,255,0.7)"
      : "#2487ca";
  const iconHoverColor = isLightBackground
    ? "#1d6fb0"
    : isHome
      ? "#ffffff"
      : "#1d6fb0";
  const logoFilter = isLightBackground
    ? "none"
    : isHome
      ? "brightness(0) invert(1)"
      : "none";

  return (
    <footer
      className="relative z-10 border-t py-3 md:py-2 mt-[50px] transition-all duration-[1.5s] ease-in-out"
      style={{
        backgroundColor: isHome ? "transparent" : "#ffffff",
        borderColor: isHome ? "transparent" : "var(--color-hairline)",
      }}
    >
      <div className="flex items-center justify-center gap-8 md:gap-10">
        <Image
          src="/hiwe.png"
          alt="HIWE"
          width={1206}
          height={334}
          className="h-4 w-auto object-contain transition-all duration-[1.5s] ease-in-out"
          style={{ filter: logoFilter }}
        />

        <div className="flex items-center gap-1">
          <a
            href="https://www.hiwe.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[1.5s] ease-in-out"
            style={{ color: iconColor, "--hover-color": iconHoverColor } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <Globe className="size-5" />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=8615819205996"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[1.5s] ease-in-out"
            style={{ color: iconColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <MessageCircle className="size-5" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61550592422623"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[1.5s] ease-in-out"
            style={{ color: iconColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <Share2 className="size-5" />
          </a>
          <a
            href="https://www.instagram.com/haiwenduan?igsh=eGd2c2Fkbnplazl1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors duration-[1.5s] ease-in-out"
            style={{ color: iconColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <Camera className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
