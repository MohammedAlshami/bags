"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/** Renders Footer (includes newsletter) only when not on an admin route. */
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
