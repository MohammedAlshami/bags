"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import type { NavCategory } from "@/lib/get-nav-categories";

type Props = {
  categories: NavCategory[];
};

/** Renders the main site Navbar only when not on an admin route. */
export default function ConditionalNavbar({ categories }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar categories={categories} />;
}
