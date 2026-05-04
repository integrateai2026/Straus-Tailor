import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Straus Tailor Shop — Master Tailoring & Alterations in Fargo, ND",
  description: "Expert tailoring, alterations and repairs in Fargo, ND. Walk-ins welcome. No appointment needed. (701) 929-8262.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${dancingScript.variable} ${inter.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
