import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOMING-BIRD-AUCTION | 모의 부동산 경매",
  description: "당신의 완벽한 보금자리를 찾아서 - 모의 경매 플랫폼",
  icons: { icon: "/icon48.png" },
  openGraph: {
    title: "HOMING-BIRD-AUCTION | 모의 부동산 경매",
    description: "당신의 완벽한 보금자리를 찾아서 - 모의 경매 플랫폼",
    images: [{ url: "/op.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
