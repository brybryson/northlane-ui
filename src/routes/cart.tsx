import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Check,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useCart } from "../context/cart-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Footer } from "../components/layout/Footer";
import { useAuthUser } from "@/hooks/use-auth-user";
import { SignUpNoticeModal } from "@/components/SignUpNoticeModal";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — Northlane Workspace" },
      { name: "description", content: "Review and configure your Northlane studio items before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuthUser();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    coupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    total,
    itemCount,
    addToCart,
    setIsOpen: openCartDrawer,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = applyCoupon(couponCode);
    if (res.success) {
      toast.success(res.message);
      setCouponCode("");
    } else {
      toast.error(res.message);
    }
  };

  const freeShippingThreshold = 15000;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  function formatPrice(amount: number): string {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function handleAIAssistantAddToCart(p: any) {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.img || p.image || "",
      category: p.category,
      stockCount: p.stockCount,
      quantity: 1,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Navigation Header matching /shop & Landing */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-background/90 backdrop-blur-xl transition-all duration-300">
          <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
            <Link
              to="/"
              className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
              <span>Northlane</span>
            </Link>

            <nav className="hidden justify-center gap-8 lg:flex">
              <Link to="/shop" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <a
                href="/#collections"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Collections
              </a>
              <a
                href="/#concierge"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Concierge
              </a>
              <a
                href="/#workspaces"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Workspaces
              </a>
              <a
                href="/#journal"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Journal
              </a>
            </nav>

            <div className="flex items-center justify-end gap-2">
              <Link
                to="/wishlist"
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-hairline bg-surface text-foreground hover:border-foreground/30 transition cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
              </Link>

              <button
                onClick={() => openCartDrawer(true)}
                className="relative flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-foreground/30 transition shadow-xs cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Studio Bag</span> ({itemCount})
              </button>

              {!user ? (
                <Link
                  to="/auth"
                  className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-foreground/40 hover:bg-muted/30 cursor-pointer"
                >
                  Sign In
                </Link>
              ) : (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success("Signed out successfully");
                  }}
                  className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-foreground/40 hover:text-foreground hover:bg-muted/30 cursor-pointer"
                >
                  Sign Out
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 lg:hidden text-foreground hover:text-accent cursor-pointer ml-1"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-hairline bg-background p-4 flex flex-col gap-3 text-sm font-semibold">
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-foreground hover:text-accent">
                Shop Catalog
              </Link>
              <a
                href="/#collections"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Collections
              </a>
              <a
                href="/#concierge"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Concierge
              </a>
              <a
                href="/#workspaces"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Workspaces
              </a>
              <a
                href="/#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Journal
              </a>

              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-foreground hover:border-foreground/40 hover:bg-muted/30 mt-1"
                >
                  Sign In / Create Account
                </Link>
              ) : (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await supabase.auth.signOut();
                    toast.success("Signed out successfully");
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted/30 mt-1"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="bg-surface/50 border-b border-hairline py-8 sm:py-12">
          <div className="container-editorial">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Studio Configuration
                </span>
                <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  Shopping Bag
                  {itemCount > 0 && (
                    <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-bold text-accent">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  )}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Review your configured workspace products, adjust item quantities, or apply promotional studio discounts before checkout.
                </p>
              </div>

              {/* Free Shipping Alert Box */}
              {items.length > 0 && (
                <div className="rounded-2xl border border-hairline bg-background p-4 min-w-[280px] sm:max-w-xs space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    {remainingForFreeShipping > 0 ? (
                      <span className="text-muted-foreground text-[11px]">
                        Add <span className="font-semibold text-foreground">{formatPrice(remainingForFreeShipping)}</span> for <span className="font-semibold text-accent">Free Delivery</span>
                      </span>
                    ) : (
                      <span className="text-foreground font-semibold text-xs flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-accent" /> Free Express Delivery Unlocked!
                      </span>
                    )}
                    <span className="text-xs font-bold text-foreground">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <Progress value={freeShippingProgress} className="h-1.5 bg-muted/40 [&>div]:bg-accent" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <main className="container-editorial py-8 sm:py-12">
          {items.length === 0 ? (
            <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-surface border border-hairline flex items-center justify-center text-muted-foreground shadow-xs">
                <ShoppingBag className="h-8 w-8 opacity-40" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-foreground tracking-tight">Your studio bag is empty</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Discover studio-grade mechanical keyboards, precision mice, and ergonomic desks in our catalog.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/shop" })}
                className="mt-2 rounded-full px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer bg-foreground text-background hover:bg-foreground/90"
              >
                Explore Shop Catalog
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-hairline bg-surface/40 p-4 sm:p-5 transition-all duration-200 hover:border-foreground/20 hover:bg-surface/70 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between shadow-2xs"
                    >
                      {/* Left Block: Image & Meta */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl border border-hairline bg-background overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                            {item.name}
                          </h3>
                          {item.category && (
                            <span className="inline-block rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {item.category}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Stepper, Item Total & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline">
                        {/* Quantity Stepper */}
                        <div className="flex flex-col gap-1 items-center">
                          <div className="flex items-center rounded-full border border-hairline bg-surface px-1 py-0.5 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.stockCount ?? 15)}
                              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title={
                                item.quantity >= (item.stockCount ?? 15)
                                  ? `Max stock (${item.stockCount ?? 15}) reached`
                                  : "Increase quantity"
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {item.quantity >= (item.stockCount ?? 15) && (
                            <span className="text-[10px] text-amber-500 font-semibold">
                              Max Limit ({item.stockCount ?? 15})
                            </span>
                          )}
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[100px]">
                          <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Trash Action */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground/40 hover:text-rose-500 transition-colors p-1.5 rounded-full hover:bg-rose-500/10"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl border border-hairline bg-surface/50 p-6 space-y-6 shadow-sm">
                  <h2 className="text-lg font-bold tracking-tight text-foreground border-b border-hairline pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                      <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                    </div>

                    {coupon && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" /> Coupon ({coupon.code})
                        </span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Estimated Shipping</span>
                      <span className="font-semibold text-foreground">
                        {remainingForFreeShipping === 0 ? "FREE" : "$15.00"}
                      </span>
                    </div>

                    <div className="border-t border-hairline pt-3 flex justify-between text-base font-bold text-foreground">
                      <span>Estimated Total</span>
                      <span className="text-lg text-foreground">
                        {formatPrice(total + (remainingForFreeShipping === 0 ? 0 : 15))}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Form */}
                  <div className="pt-2 border-t border-hairline space-y-2.5">
                    <label className="text-xs font-semibold text-muted-foreground">Promotional Code</label>
                    {coupon ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" /> {coupon.code} ({coupon.discountPercent}% OFF)
                        </span>
                        <button
                          onClick={removeCoupon}
                          className="text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <Input
                          placeholder="e.g. STUDIO20"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="h-10 text-xs rounded-full bg-background"
                        />
                        <Button type="submit" variant="outline" className="h-10 text-xs rounded-full px-5 font-semibold cursor-pointer">
                          Apply
                        </Button>
                      </form>
                    )}
                    <p className="text-[11px] text-muted-foreground">Try code <span className="font-mono font-bold text-foreground">STUDIO20</span> for 20% off.</p>
                  </div>

                  <Button
                    onClick={() => navigate({ to: "/checkout" })}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <AIShoppingAssistant
        onAddToCart={handleAIAssistantAddToCart}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}

