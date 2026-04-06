import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Playpen_Sans_Arabic } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "./components/ConditionalNavbar";
import ConditionalFooter from "./components/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playpenSansArabic = Playpen_Sans_Arabic({
  variable: "--font-playpen-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "الملكة جولد",
  description: "عناية مختارة بعناية — منتجات تليق بكِ.",
};

import { CartProvider } from "./context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${playpenSansArabic.variable} antialiased font-sans overflow-x-hidden`}
      >
        <CartProvider>
          <ConditionalNavbar />
          {children}
          <ConditionalFooter />
        </CartProvider>
      </body>
    </html>
  );
}
