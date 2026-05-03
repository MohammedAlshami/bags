"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import type { CartItem } from "@/lib/cart";

export const addToCartToastTitleProduct = "تمت الإضافة إلى سلّتكِ";
export const addToCartToastTitlePackage = "تمت إضافة الباقة إلى سلّتكِ";

export function useAddToCartWithToast() {
  const { addToCart } = useCart();

  const addToCartWithToast = useCallback(
    (item: Omit<CartItem, "quantity">, options?: { title?: string }) => {
      addToCart(item);
      toast.success(options?.title ?? addToCartToastTitleProduct, {
        description: item.name,
      });
    },
    [addToCart]
  );

  return { addToCartWithToast };
}
