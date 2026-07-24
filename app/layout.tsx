import type { Metadata } from "next";
import Script from "next/script";
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
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a63b36c54bb9f1d4deaccc2/1juan9oms';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
