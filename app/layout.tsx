import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Tajawal } from "next/font/google";
import "./globals.css";
import { getNavData } from "@/lib/get-nav-categories";
import ConditionalNavbar from "./components/ConditionalNavbar";
import ConditionalFooter from "./components/ConditionalFooter";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { CartProvider } from "./context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "الملكة جولد",
  description: "عناية مختارة بعناية — منتجات تليق بكِ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { categories } = await getNavData();
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body
        className={`${tajawal.variable} ${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased font-sans overflow-x-hidden`}
      >
        <CartProvider>
          <ConditionalNavbar categories={categories} />
          {children}
          <ConditionalFooter />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
