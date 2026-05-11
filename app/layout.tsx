import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import QueryProvider from "@/providers/query.provider";
import ThemeWrapper from "@/components/ThemeWrapper";
import "./globals.css";

// ─── Pretendard Variable 로컬 폰트 ───────────────────────────────────────────

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
  preload: true,
});

// ─── 메타데이터 ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "담다 — 통합 장바구니",
  description: "흩어져 있는 쇼핑몰의 상품 링크를 한곳에 모으고 관리하세요.",
  applicationName: "담다",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`h-full ${pretendard.variable}`}>
      <head />
      <body
        className="min-h-full antialiased flex justify-center font-sans text-base"
        style={{ backgroundColor: "#ECEAE6" }}
      >
        <QueryProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
