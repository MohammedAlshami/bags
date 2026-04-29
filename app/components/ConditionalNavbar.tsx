"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import type { NavCategory, NavCollection } from "@/lib/get-nav-categories";

type Props = {
  categories: NavCategory[];
  collections: NavCollection[];
};

/** Renders the main site Navbar only when not on an admin route. */
export default function ConditionalNavbar({ categories, collections }: Props) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar categories={categories} collections={collections} />;
}
