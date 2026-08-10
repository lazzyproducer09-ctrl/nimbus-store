"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// One line in the cart. Same product with a different size/colour is a separate line.
export type CartItem = {
  id: string; // productId + size + color, so variants are separate lines
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "nimbus-cart";

function lineId(productId: string, size: string | null, color: string | null) {
  return [productId, size ?? "", color ?? ""].join("__");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load the saved cart from the browser once, on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  // Save the cart to the browser whenever it changes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore storage errors */
    }
  }, [items, hydrated]);

  const addItem = useCallback<CartContextType["addItem"]>((item, quantity = 1) => {
    setItems((prev) => {
      const id = lineId(item.productId, item.size, item.color);
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + quantity } : p,
        );
      }
      return [...prev, { ...item, id, quantity }];
    });
    setIsOpen(true); // slide the drawer open on add
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.flatMap((p) => {
        if (p.id !== id) return [p];
        return quantity <= 0 ? [] : [{ ...p, quantity }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((n, p) => n + p.quantity, 0);
  const subtotal = items.reduce((n, p) => n + p.price * p.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        hydrated,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
