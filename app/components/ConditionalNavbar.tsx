"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

/** Renders the main site Navbar only when not on an admin route. */
export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar />;
}
