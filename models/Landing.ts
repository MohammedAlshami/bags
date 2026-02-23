import mongoose from "mongoose";

const CarouselItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  year: String,
  desc: String,
  image: String,
});

const LandingSchema = new mongoose.Schema(
  {
    type: { type: String, default: "landing" },
    hero: {
      title: String,
      subtitle: String,
      ctaText: String,
      ctaHref: String,
      videoSrc: String,
    },
    carousel: {
      sectionTitle: String,
      sectionSubtitle: String,
      items: [CarouselItemSchema],
    },
    banner: {
      imagePath: String,
      headline: String,
    },
    navImages: [String],
  },
  { timestamps: true, collection: "landing" }
);

export default mongoose.models.Landing || mongoose.model("Landing", LandingSchema);
