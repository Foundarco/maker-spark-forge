// Simple in-memory cart in localStorage. Client-only.
import { useEffect, useState, useCallback } from "react";

export type CartItem = { slug: string; name: string; price_display?: string | null; quantity: number };
const KEY = "brand-cart-v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:changed"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener("cart:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("cart:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const next = [...read()];
    const idx = next.findIndex((i) => i.slug === item.slug);
    if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
    else next.push({ ...item, quantity: qty });
    write(next);
  }, []);
  const setQty = useCallback((slug: string, qty: number) => {
    const next = read()
      .map((i) => (i.slug === slug ? { ...i, quantity: qty } : i))
      .filter((i) => i.quantity > 0);
    write(next);
  }, []);
  const remove = useCallback((slug: string) => {
    write(read().filter((i) => i.slug !== slug));
  }, []);
  const clear = useCallback(() => write([]), []);
  return { items, add, setQty, remove, clear };
}
