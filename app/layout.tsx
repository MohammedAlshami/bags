import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Tajawal } from "next/font/google";
import "./globals.css";
import { getNavData } from "@/lib/get-nav-categories";
import ConditionalNavbar from "./components/ConditionalNavbar";
import ConditionalFooter from "./components/ConditionalFooter";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CartToaster } from "./components/CartToaster";
import { sql } from "@/lib/db";

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
  const blogCountRows = await sql`SELECT COUNT(*) as cnt FROM blog_posts WHERE status = 'published'`;
  const hasBlog = Number((blogCountRows[0] as { cnt: number }).cnt) > 0;
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body
        className={`${tajawal.variable} ${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased font-sans overflow-x-hidden`}
      >
        <CartProvider>
          <CurrencyProvider>
            <ConditionalNavbar categories={categories} hasBlog={hasBlog} />
            {children}
          <ConditionalFooter hasBlog={hasBlog} />
          <WhatsAppFloat />
          <CartToaster />
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
