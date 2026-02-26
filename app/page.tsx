import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { ProductsSection } from "./components/ProductsSection";
import { HeroSection } from "./components/HeroSection";
import { TextWithImagesSection } from "./components/TextWithImagesSection";
import { ImageWithTextSection } from "./components/ImageWithTextSection";
import { CategoryGridSection } from "./components/CategoryGridSection";
import { ShopByCategorySection } from "./components/ShopByCategorySection";
import { JoinUsSection } from "./components/JoinUsSection";
import { GallerySection } from "./components/GallerySection";

export default async function Home() {
  await dbConnect();
  const products = await Product.find({}).lean();
  const productsList = products.map((p) => ({
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    slug: p.slug,
  }));

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#ffffff" }}>
      <HeroSection />
      <TextWithImagesSection />
      <ImageWithTextSection />
      <CategoryGridSection />
      <ShopByCategorySection />
      <JoinUsSection />
      <GallerySection />
      <ProductsSection products={productsList} />
    </main>
  );
}
