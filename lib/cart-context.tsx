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
  selected: boolean; // is this line ticked for checkout?
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  selectedItems: CartItem[];
  selectedCount: number;
  selectedSubtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity" | "selected">, quantity?: number) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelected: (id: string) => void;
  setAllSelected: (selected: boolean) => void;
  selectOnly: (id: string) => void;
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
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        // Older saved carts had no `selected` flag — default those to ticked.
        setItems(parsed.map((i) => ({ ...i, selected: i.selected !== false })));
      }
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
        // Bump quantity and (re-)tick it — adding implies intent to buy.
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + quantity, selected: true } : p,
        );
      }
      return [...prev, { ...item, id, quantity, selected: true }];
    });
    setIsOpen(true); // slide the drawer open on add
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeItems = useCallback((ids: string[]) => {
    const drop = new Set(ids);
    setItems((prev) => prev.filter((p) => !drop.has(p.id)));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.flatMap((p) => {
        if (p.id !== id) return [p];
        return quantity <= 0 ? [] : [{ ...p, quantity }];
      }),
    );
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );
  }, []);

  const setAllSelected = useCallback((selected: boolean) => {
    setItems((prev) => prev.map((p) => ({ ...p, selected })));
  }, []);

  // Tick exactly one line and untick the rest (used by "Buy now").
  const selectOnly = useCallback((id: string) => {
    setItems((prev) => prev.map((p) => ({ ...p, selected: p.id === id })));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((n, p) => n + p.quantity, 0);
  const subtotal = items.reduce((n, p) => n + p.price * p.quantity, 0);
  const selectedItems = items.filter((p) => p.selected);
  const selectedCount = selectedItems.reduce((n, p) => n + p.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((n, p) => n + p.price * p.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        selectedItems,
        selectedCount,
        selectedSubtotal,
        isOpen,
        hydrated,
        openCart,
        closeCart,
        addItem,
        removeItem,
        removeItems,
        updateQuantity,
        toggleSelected,
        setAllSelected,
        selectOnly,
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
