import type { Metadata } from "next";
import "../styles/global.css";
import "github-markdown-css/github-markdown.css";

import { siteConfig } from "../lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.siteTitle,
  description: siteConfig.description,
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: siteConfig.siteTitle,
    description: siteConfig.description,
    images: [siteConfig.siteUrl + "/images/og.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
