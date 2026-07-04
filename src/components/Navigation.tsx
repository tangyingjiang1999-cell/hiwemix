"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useLang();
  const { user } = useAuth();

  const navItems: { label: string; href: string }[] = [
    { label: t.navFormulaSearch, href: "/" },
    { label: t.navColorLibrary, href: "/color-library" },
    { label: t.navAppGuide, href: "/application-guide" },
  ];

  // 仅管理员可见后台管理入口
  if (user && user.role === "admin") {
    navItems.push({ label: "Admin", href: "/admin/formulas" });
  }

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
                ? "border-b-[2px] border-[#006565] font-muji-600 text-[#006565]"
                : "font-muji-400 text-[#6B7280] hover:text-[#006565]",
            ].join(" ")}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
