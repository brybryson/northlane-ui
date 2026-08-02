import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { useCart, CartItem } from "../context/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";

const FREE_SHIPPING_THRESHOLD = 15000;

const CartDrawerItem: React.FC<{
  item: CartItem;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
}> = ({ item, updateQuantity, removeFromCart }) => {
  const maxStock = item.stockCount ?? 15;
  const isMax = item.quantity >= maxStock;

  return (
    <div className="group flex items-center gap-4 py-4 border-b border-hairline last:border-0">
      {/* Product Image */}
      <div className="h-20 w-20 rounded-2xl bg-surface border border-hairline overflow-hidden shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Details & Actions (Exact 2-row height match) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
        {/* Top Row: Name, Category, Delete Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
              {item.name}
            </h4>
            {item.category && (
              <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                {item.category}
              </p>
            )}
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-muted-foreground/40 hover:text-rose-500 transition-colors p-1 -mr-1"
            title="Remove item"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Row: Stepper & Total Price */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-hairline bg-surface px-1 py-0.5 shadow-2xs">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-foreground">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={isMax}
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={isMax ? `Max stock (${maxStock}) reached` : "Increase quantity"}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {isMax && (
              <span className="text-[10px] font-semibold text-amber-500">Max limit</span>
            )}
          </div>

          <div className="text-sm font-bold text-foreground tracking-tight">
            ${(item.price * item.quantity).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate({ to: "/checkout" });
  };

  const handleViewCart = () => {
    setIsOpen(false);
    navigate({ to: "/cart" });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-hairline bg-background">
        {/* Header */}
        <SheetHeader className="px-6 py-4.5 border-b border-hairline flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <SheetTitle className="text-base font-bold tracking-tight text-foreground">
              Your Studio Bag
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Free Shipping Bar */}
        <div className="bg-surface/50 px-6 py-3.5 border-b border-hairline space-y-2">
          <div className="flex justify-between items-center text-xs">
            {remainingForFreeShipping > 0 ? (
              <span className="text-muted-foreground">
                Add <span className="text-foreground font-semibold">${remainingForFreeShipping.toLocaleString()}</span> more for <span className="text-foreground font-semibold">Free Express Delivery</span>
              </span>
            ) : (
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-accent" /> You've unlocked Free Express Shipping!
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground">{Math.round(freeShippingProgress)}%</span>
          </div>
          <Progress value={freeShippingProgress} className="h-1.5 bg-muted/40 [&>div]:bg-accent" />
        </div>

        {/* Cart Items Scroll Area */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-surface border border-hairline flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-8 w-8 opacity-30" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Your studio bag is empty</h3>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Explore our catalog to add studio-grade items to your setup.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                navigate({ to: "/shop" });
              }}
              className="mt-2 text-xs rounded-full px-5 py-2 font-semibold"
            >
              Browse Shop Catalog
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6">
            <div className="divide-y divide-hairline">
              {items.map((item) => (
                <CartDrawerItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-hairline bg-surface/30 space-y-4 shrink-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-base font-bold text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Shipping</span>
                <span>{remainingForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleViewCart}
                className="w-full h-10 border-hairline text-xs font-semibold rounded-full hover:bg-surface/80 cursor-pointer"
              >
                View Full Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

