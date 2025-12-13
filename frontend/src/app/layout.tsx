import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ★作成したヘッダーをインポート
import Header from "@/components/Header"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mahjong Evaluator",
  description: "配牌評価アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ★ここにHeaderを配置！これで全ページに表示されます */}
        <Header />
        
        {/* 各ページの中身 */}
        {children}
      </body>
    </html>
  );
}