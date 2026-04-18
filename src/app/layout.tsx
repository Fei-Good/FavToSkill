import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FavToSkill — 把收藏夹变成知识地图",
  description: "将你的 Bilibili 收藏视频自动整理为可对话、可交互的知识地图",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
