"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageContext";

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { label: "Formula Search", href: "/" },
    { label: "Color Visual Library", href: "/color-library" },
    { label: "Application Guide", href: "/application-guide" },
  ];

  return (
    <nav className="flex h-12 items-center overflow-x-auto border-b border-[#E5E7EB] bg-white px-4 whitespace-nowrap scrollbar-hide sm:px-[40px]">
      {navItems.map((item) => {
        const isActive =
          (item.href === "/" && pathname === "/") ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <a
            key={item.label}
            href={item.href}
            className={[
              "mr-[40px] pb-[14px] pt-[14px] transition-all duration-200 ease-out",
              isActive
                ? "border-b-[2px] border-[#0D9488] font-muji-600 text-[#0D9488]"
                : "font-muji-400 text-[#6B7280] hover:text-[#0D9488]",
            ].join(" ")}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
