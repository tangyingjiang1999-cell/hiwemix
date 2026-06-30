import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAIWEN MIX - Formula Search",
  description: "Car refinish paint formula search system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F9FAFB] text-[#111827]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
