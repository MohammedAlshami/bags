"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/** Renders the main site Footer only when not on an admin route. */
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
