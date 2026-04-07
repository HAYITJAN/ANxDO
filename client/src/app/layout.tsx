import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Providers } from "@/app/providers";
import { RightRailAdSlot } from "@/components/layout/RightRailAdSlot";
import "./globals.css";

/** SSRda zustand vendor-chunk xatosi — header faqat clientda (barcha sahifalar, jumladan not-found) */
const SiteHeader = dynamic(
  () => import("@/components/layout/SiteHeader").then((m) => m.SiteHeader),
  {
    ssr: false,
    loading: () => <div className="h-14 border-b border-white/[0.06] bg-background/92 sm:h-16" />,
  }
);

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ANDO",
  description: "Anime va dorama — bitta platformada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased text-violet-100`}
      >
        <Providers>
          <Suspense fallback={<div className="h-14 border-b border-white/[0.06] bg-background/92 sm:h-16" />}>
            <SiteHeader />
          </Suspense>
          <Suspense fallback={null}>
            <SiteAnalytics />
          </Suspense>
          {children}
          <RightRailAdSlot />
        </Providers>
      </body>
    </html>
  );
}
