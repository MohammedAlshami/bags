import type { Metadata } from "next";
import { Geist_Mono, Cormorant_Garamond, Tajawal } from "next/font/google";

// Only Tajawal (the body font) is preloaded. The rest load on demand so they never compete with the
// CSS and the hero image on slow connections.
import "./globals.css";
import { getNavData } from "@/lib/get-nav-categories";
import ConditionalNavbar from "./components/ConditionalNavbar";
import { OffersBanner } from "./components/OffersBanner";
import ConditionalFooter from "./components/ConditionalFooter";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { CartProvider } from "./context/CartContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CartToaster } from "./components/CartToaster";
import { sql } from "@/lib/db";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goldqueen.store"),
  title: {
    default: "الملكة جولد — عناية مختارة بعناية",
    template: "%s | الملكة جولد",
  },
  description: "عناية مختارة بعناية — منتجات تليق بكِ. تشكيلة واسعة من منتجات العناية بالبشرة والجمال مع خدمة توصيل إلى اليمن والمملكة.",
  icons: { icon: "/logo_img.png", apple: "/logo_img.png" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "الملكة جولد",
    title: "الملكة جولد — عناية مختارة بعناية",
    description: "عناية مختارة بعناية — منتجات تليق بكِ. تشكيلة واسعة من منتجات العناية بالبشرة والجمال.",
    images: [{ url: "/logo_img.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "الملكة جولد — عناية مختارة بعناية",
    description: "عناية مختارة بعناية — منتجات تليق بكِ.",
    images: ["/logo_img.png"],
  },
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
      <head>
        <link rel="icon" href="/logo_img.png" type="image/png" />
        <link rel="shortcut icon" href="/logo_img.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo_img.png" />
      </head>
      <body
        className={`${tajawal.variable} ${geistMono.variable} ${cormorant.variable} antialiased font-sans overflow-x-hidden`}
      >
        <CartProvider>
          <CurrencyProvider>
            <ConditionalNavbar categories={categories} hasBlog={hasBlog} />
            <OffersBanner />
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
