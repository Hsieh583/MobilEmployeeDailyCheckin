import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "員工打卡系統",
  description: "簡易員工線上打卡系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
