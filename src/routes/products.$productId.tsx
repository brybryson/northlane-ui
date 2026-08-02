import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Star,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  SlidersHorizontal,
  Share2,
  Heart,
  Sliders,
  X,
} from "lucide-react";
import { CATALOG_PRODUCTS, CatalogProduct } from "../lib/products.data";
import { Button } from "../components/ui/button";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/use-auth-user";
import { supabase } from "@/integrations/supabase/client";
import { SignUpNoticeModal } from "@/components/SignUpNoticeModal";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";

import { useCart } from "@/context/cart-context";

export const Route = createFileRoute("/products/$productId")({
  head: ({ params }) => {
    const product = CATALOG_PRODUCTS.find((p) => p.id === params.productId);
    const title = product
      ? `${product.name} — Northlane Workspace`
      : "Product Not Found — Northlane Workspace";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: product?.description || "Explore Northlane studio workspace products.",
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: product?.description || "Explore Northlane studio workspace products.",
        },
      ],
    };
  },
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { user } = useAuthUser();
  const { addToCart, setIsOpen: openCartDrawer, itemCount } = useCart();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const { productId } = Route.useParams();
  const navigate = useNavigate();

  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "bundle">("specs");

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("northlane_wishlist_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const wishlistCount = wishlistIds.length;
  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  useEffect(() => {
    localStorage.setItem("northlane_wishlist_ids", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    async function syncWishlist() {
      if (!user) return;
      try {
        const { data, error } = await (supabase as any)
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);
        if (data && !error && data.length > 0) {
          const dbIds = data.map((row: any) => row.product_id);
          setWishlistIds((prev) => Array.from(new Set([...prev, ...dbIds])));
        }
      } catch (e) {
        // Table fallback
      }
    }
    syncWishlist();
  }, [user]);

  const toggleWishlist = async () => {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    if (!product) return;

    let updated: string[];
    if (isWishlisted) {
      updated = wishlistIds.filter((id) => id !== product.id);
      toast.info(`Removed ${product.name} from wishlist`);
      try {
        await (supabase as any)
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);
      } catch (e) {}
    } else {
      updated = [...wishlistIds, product.id];
      toast.success(`Saved ${product.name} to wishlist!`);
      try {
        await (supabase as any)
          .from("wishlists")
          .upsert({ user_id: user.id, product_id: product.id });
      } catch (e) {}
    }
    setWishlistIds(updated);
  };

  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <div className="container-editorial py-24 text-center">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The studio product you requested could not be located in our catalog.
          </p>
          <Button
            onClick={() => navigate({ to: "/shop" })}
            className="mt-6 rounded-full px-6 py-2.5"
          >
            Back to Studio Catalog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Cross-sell items in same or adjacent categories
  const bundleItems = CATALOG_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category !== product.category,
  ).slice(0, 2);

  function handleAddToCart(p: CatalogProduct = product!, qty: number = quantity) {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.img,
      category: p.category,
      stockCount: p.stockCount,
      quantity: qty,
    });
  }

  function handleAddBundleToCart() {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    handleAddToCart(product!, 1);
    bundleItems.forEach((b) => {
      if (selectedBundleIds.includes(b.id)) {
        handleAddToCart(b, 1);
      }
    });
  }

  const bundleTotal =
    product.price +
    bundleItems
      .filter((b) => selectedBundleIds.includes(b.id))
      .reduce((sum, b) => sum + b.price, 0);

  const galleryImages =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.img];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-background/90 backdrop-blur-xl">
          <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
            >
              <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
              <span>Northlane</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
              </Link>

              <Link
                to="/wishlist"
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-hairline bg-surface text-foreground hover:border-foreground/30 transition cursor-pointer"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>

              <button
                onClick={() => openCartDrawer(true)}
                className="relative flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-foreground/30 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Bag ({itemCount})</span>
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
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="container-editorial py-3 sm:py-4 border-b border-hairline">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-foreground">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-none">
              {product.name}
            </span>
          </div>
        </div>

        {/* Main PDP Showcase */}
        <section className="container-editorial py-8 sm:py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            {/* Left Column: Image Gallery with Next / Prev Arrow Navigation */}
            <div>
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-hairline bg-surface aspect-[4/3] shadow-lg group">
                <img
                  src={galleryImages[activeImageIdx] || product.img}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-500 ease-out"
                />
                <div className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold text-accent backdrop-blur border border-hairline uppercase tracking-wider">
                  ★ {product.rating} · Verified Quality
                </div>

                {/* Left & Right Arrow Navigation Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === 0 ? galleryImages.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur border border-hairline shadow-md transition-all hover:bg-background hover:scale-110 active:scale-95"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === galleryImages.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur border border-hairline shadow-md transition-all hover:bg-background hover:scale-110 active:scale-95"
                      aria-label="Next Image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Gallery Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {galleryImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all h-16 w-16 sm:h-20 sm:w-20 bg-surface ${
                        activeImageIdx === i
                          ? "border-foreground scale-105 shadow-xs"
                          : "border-hairline opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Specifications & Purchasing Controls */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category & Brand Tag */}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  <span>{product.brand}</span>
                  <span>·</span>
                  <span>{product.category}</span>
                </div>

                {/* Title & Subtitle */}
                <h1 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
                  {product.subtitle}
                </p>

                {/* Rating & Stock Indicator */}
                <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium border-b border-hairline pb-4 sm:pb-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span className="font-bold text-foreground">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviewsCount} reviews)</span>
                  </div>
                  <span className="h-3 w-px bg-hairline hidden sm:inline" />
                  <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-emerald-600 font-bold">
                    In Stock ({product.stockCount} available)
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    ₱{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm sm:text-lg text-muted-foreground line-through">
                      ₱{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Free Express Delivery</span>
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground font-normal">
                  {product.description}
                </p>

                {/* Clean Recommended Workflow Profiles (No AI Sparkles Icon) */}
                <div className="mt-6 rounded-2xl border border-hairline bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
                    <UserCheck className="h-4 w-4 text-accent" /> Recommended Profiles
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.attributes.bestFor.map((persona) => (
                      <span
                        key={persona}
                        className="rounded-full bg-background border border-hairline px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {persona}
                      </span>
                    ))}
                    <span className="rounded-full bg-background border border-hairline px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Style: {product.attributes.workspaceStyle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Add to Bag */}
              <div className="mt-6 border-t border-hairline pt-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                  <div className="flex items-center justify-between sm:justify-start rounded-full border border-hairline bg-surface p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-background"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-background"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product, quantity)}
                    className="flex-1 rounded-full py-5 sm:py-6 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" /> Add to Studio Bag · ₱
                    {(product.price * quantity).toLocaleString()}
                  </Button>

                  <button
                    onClick={toggleWishlist}
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-hairline flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isWishlisted
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-surface text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-label="Wishlist"
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-accent text-accent" : ""}`} />
                  </button>
                </div>

                {/* Value Guarantees */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] font-semibold text-muted-foreground pt-4 border-t border-hairline">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="h-4 w-4 text-accent" /> Free Express Delivery
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="h-4 w-4 text-accent" /> 30-Day Risk-Free Trial
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-accent" /> 3-Year Studio Warranty
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications & Reviews Tabs */}
        <section className="bg-surface border-t border-b border-hairline py-12 sm:py-16">
          <div className="container-editorial">
            {/* Clean Tab Switcher Header */}
            <div className="flex border-b border-hairline mb-8 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition shrink-0 border-b-2 ${
                  activeTab === "specs"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab("bundle")}
                className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition shrink-0 border-b-2 ${
                  activeTab === "bundle"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Frequently Bought Together
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 text-xs sm:text-sm font-bold tracking-tight transition shrink-0 border-b-2 ${
                  activeTab === "reviews"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Verified Reviews ({product.reviews.length || product.reviewsCount})
              </button>
            </div>

            {/* Tab 1: Specs */}
            {activeTab === "specs" && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-hairline bg-background p-4 sm:p-5 hover:border-foreground/30 transition-all shadow-xs"
                  >
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      {key}
                    </div>
                    <div className="mt-1 text-sm font-bold text-foreground">{val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Frequently Bought Together Bundle */}
            {activeTab === "bundle" && (
              <div className="max-w-4xl rounded-3xl border border-hairline bg-background p-5 sm:p-8">
                <div className="text-sm sm:text-base font-bold text-foreground mb-4">
                  Complete Your Setup Bundle (Save 10%)
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Main Product */}
                  <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-3.5 sm:p-4">
                    <input type="checkbox" checked disabled className="h-4 w-4 accent-accent" />
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">
                        {product.name} (This Item)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₱{product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Additional Bundle Products */}
                  {bundleItems.map((item) => {
                    const isChecked = selectedBundleIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          setSelectedBundleIds((prev) =>
                            isChecked ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                          )
                        }
                        className={`flex items-center gap-4 rounded-2xl border p-3.5 sm:p-4 cursor-pointer transition ${
                          isChecked
                            ? "border-foreground bg-surface"
                            : "border-hairline bg-background opacity-75"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="h-4 w-4 accent-accent"
                        />
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.subtitle} · ₱{item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-hairline pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Combined Bundle Price:</span>
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      ₱{bundleTotal.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddBundleToCart}
                    className="w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold"
                  >
                    Add Bundle to Studio Bag &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-4 sm:space-y-6">
                {product.reviews.length === 0 ? (
                  <div className="rounded-2xl border border-hairline bg-background p-8 text-center text-xs text-muted-foreground">
                    No written reviews submitted yet for this newly featured studio item.
                  </div>
                ) : (
                  product.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-hairline bg-background p-5 sm:p-6 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{rev.author}</span>
                        <span className="text-muted-foreground">{rev.date}</span>
                      </div>
                      <div className="mt-1 text-amber-500 font-bold text-xs">
                        {"★".repeat(rev.rating)}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-foreground">{rev.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>



      {/* Shared Global Footer */}
      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <AIShoppingAssistant
        onAddToCart={handleAddToCart}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}
