import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  sku?: string;
  quantity: number;
  stockCount?: number;
  selectedColor?: string;
}

interface Coupon {
  code: string;
  discountPercent: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Omit<CartItem, "quantity"> & { quantity?: number; stockCount?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "northlane_cart_v1";

const VALID_COUPONS: Record<string, number> = {
  NORTHLANE10: 10,
  STUDIO20: 20,
  WELCOME15: 15,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // Load cart from localStorage ONLY if authenticated, otherwise reset to 0 items
  useEffect(() => {
    const syncCartWithAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setItems([]);
        setCoupon(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setItems(JSON.parse(saved));
          }
        } catch {}
      }
    };

    syncCartWithAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        setItems([]);
        setCoupon(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setItems(JSON.parse(saved));
          }
        } catch {}
      }
    });

    const handleCartCleared = () => {
      setItems([]);
      setCoupon(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    };

    window.addEventListener("northlane_cart_cleared", handleCartCleared);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("northlane_cart_cleared", handleCartCleared);
    };
  }, []);

  // Sync cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (product: Omit<CartItem, "quantity"> & { quantity?: number; stockCount?: number }) => {
    const qtyToAdd = product.quantity || 1;
    const maxStock = product.stockCount ?? 15;

    let finalAddedQty = qtyToAdd;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const availableSpace = maxStock - existing.quantity;
        if (availableSpace <= 0) {
          finalAddedQty = 0;
          toast.error(`Cannot add more. Maximum available stock (${maxStock}) reached for ${product.name}.`, {
            position: "bottom-right",
          });
          return prev;
        }
        const newQty = Math.min(existing.quantity + qtyToAdd, maxStock);
        finalAddedQty = newQty - existing.quantity;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQty, stockCount: product.stockCount ?? item.stockCount }
            : item
        );
      }
      const initialQty = Math.min(qtyToAdd, maxStock);
      finalAddedQty = initialQty;
      return [...prev, { ...product, quantity: initialQty, stockCount: maxStock }];
    });

    if (finalAddedQty > 0) {
      toast.success(`Added ${finalAddedQty}x ${product.name} to your studio bag.`, {
        position: "bottom-right",
      });
    }
    // IMPORTANT: setIsOpen(true) is purposely omitted so drawer does NOT open automatically!
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = item.stockCount ?? 15;
          if (quantity > maxStock) {
            toast.error(`Maximum available stock (${maxStock}) reached for ${item.name}.`, {
              position: "bottom-right",
            });
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (VALID_COUPONS[cleanCode]) {
      const discountPercent = VALID_COUPONS[cleanCode];
      setCoupon({ code: cleanCode, discountPercent });
      return { success: true, message: `${discountPercent}% discount applied successfully!` };
    }
    return { success: false, message: "Invalid promotional code" };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
