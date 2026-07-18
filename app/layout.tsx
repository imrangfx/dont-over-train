import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-oxanium",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DontOverTrain",
  description: "Train smart. Pick a muscle group and get started.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oxanium.variable} h-full scroll-smooth antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}