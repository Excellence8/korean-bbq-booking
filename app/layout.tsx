import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korean BBQ Booking",
  description: "A SaaS platform for booking Korean BBQ restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
