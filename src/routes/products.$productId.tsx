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
  Search,
  User,
  LogOut,
  LogIn,
  Menu,
} from "lucide-react";
import { CATALOG_PRODUCTS, CatalogProduct } from "../lib/products.data";
import { Button } from "../components/ui/button";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/use-auth-user";
import { supabase } from "@/integrations/supabase/client";
import { SignUpNoticeModal } from "@/components/SignUpNoticeModal";
import { SignOutConfirmModal } from "@/components/SignOutConfirmModal";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";

import { useCart } from "@/context/cart-context";

export const Route = createFileRoute("/products/$productId")({
  head: ({ params }) => {
    const product = CATALOG_PRODUCTS.find((p) => p.id === params.productId);
    const title = product
      ? `${product.name} — Northlane Workspace`
      : "Product Not Found — Northlane Workspace";

    const jsonLdProduct = product
      ? {
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.name,
          image: [product.img],
          description: product.description,
          sku: product.id,
          brand: {
            "@type": "Brand",
            name: product.brand || "Northlane",
          },
          offers: {
            "@type": "Offer",
            url: `https://northlane.studio/products/${product.id}`,
            priceCurrency: "USD",
            price: product.price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }
      : null;

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
      scripts: jsonLdProduct
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify(jsonLdProduct),
            },
          ]
        : [],
    };
  },
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { user } = useAuthUser();
  const { addToCart, setIsOpen: openCartDrawer, itemCount } = useCart();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { productId } = Route.useParams();
  const navigate = useNavigate();

  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "bundle">("specs");
  const [reviewsPage, setReviewsPage] = useState(1);

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
    window.addEventListener("northlane_wishlist_updated", syncWishlist);
    return () => {
      window.removeEventListener("northlane_wishlist_updated", syncWishlist);
    };
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
        {/* Navigation Header — matching /shop */}
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
              <Link to="/shop" className="text-sm font-semibold text-foreground">
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
                to="/shop"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Search Catalog"
                title="Search Catalog"
              >
                <Search className="h-4 w-4" />
              </Link>

              {!user ? (
                <button
                  type="button"
                  onClick={() => setSignUpNoticeOpen(true)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <div className="relative">
                    <Heart className="h-4 w-4 text-foreground" />
                  </div>
                </button>
              ) : (
                <Link
                  to="/wishlist"
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <div className="relative">
                    <Heart className="h-4 w-4 text-foreground" />
                    {wishlistCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              <button
                onClick={() => {
                  if (!user) {
                    setSignUpNoticeOpen(true);
                  } else {
                    openCartDrawer(true);
                  }
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Studio Bag"
                title="Studio Bag"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {user && itemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {itemCount}
                    </span>
                  )}
                </div>
              </button>

              {(() => {
                const userAvatar =
                  user?.user_metadata?.avatar_url !== undefined && user?.user_metadata?.avatar_url !== null
                    ? user.user_metadata.avatar_url
                    : (user?.user_metadata?.picture || "");

                return !user ? (
                  <Link
                    to="/auth"
                    className="relative flex items-center justify-center h-8 w-8 rounded-full border border-hairline bg-surface text-foreground hover:border-foreground/40 hover:bg-muted/40 transition cursor-pointer shadow-xs"
                    title="Sign In"
                    aria-label="Sign In"
                  >
                    <LogIn className="h-4 w-4 text-accent" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSignOutModalOpen(true)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Sign Out"
                      aria-label="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>

                    <Link
                      to="/account"
                      className="relative flex items-center justify-center h-8 w-8 rounded-full border border-foreground bg-foreground text-background transition cursor-pointer overflow-hidden shadow-xs shrink-0"
                      title="Account Profile"
                      aria-label="Account Profile"
                    >
                      {userAvatar ? (
                        <img src={userAvatar} alt="User Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Link>
                  </div>
                );
              })()}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 lg:hidden text-foreground hover:text-accent cursor-pointer"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-hairline bg-background p-4 flex flex-col gap-3 text-sm font-semibold">
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-accent">
                Shop Catalog
              </Link>
              <a
                href="/#collections"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground"
              >
                Collections
              </a>
              <a
                href="/#concierge"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground"
              >
                Concierge
              </a>
              <a
                href="/#workspaces"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground"
              >
                Workspaces
              </a>
              <a
                href="/#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground"
              >
                Journal
              </a>

              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-foreground hover:border-foreground/40 hover:bg-muted/30"
                >
                  Sign In / Create Account
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignOutModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted/30 cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
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
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm sm:text-lg text-muted-foreground line-through">
                      ${product.originalPrice.toLocaleString()}
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
                    <ShoppingBag className="h-4 w-4 mr-2" /> Add to Studio Bag · $
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
            {/* Premium Tab Switcher */}
            <div className="flex border-b border-hairline mb-10 gap-0 overflow-x-auto no-scrollbar">
              {(["specs", "bundle", "reviews"] as const).map((tab) => {
                const labels: Record<string, string> = {
                  specs: "Technical Specifications",
                  bundle: "Frequently Bought Together",
                  reviews: `Verified Reviews (${product.reviews.length || product.reviewsCount})`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 mr-6 sm:mr-8 text-xs sm:text-sm font-bold tracking-tight transition-all shrink-0 border-b-2 ${
                      activeTab === tab
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* ── Tab 1: Technical Specifications ── */}
            {activeTab === "specs" && (
              <div className="w-full space-y-6">
                <div className="rounded-2xl border border-hairline bg-background p-6 sm:p-8 shadow-xs">
                  <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-1">
                    Performance & Hardware
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-6">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-10">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-hairline/60 text-xs sm:text-sm"
                      >
                        <span className="font-semibold text-muted-foreground">{key}</span>
                        <span className="font-bold text-foreground text-right ml-4">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 2: Frequently Bought Together ── */}
            {activeTab === "bundle" && (
              <div className="w-full">
                <div className="rounded-3xl border border-hairline bg-background p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-accent">Bundle & Save</div>
                      <h3 className="text-base font-bold text-foreground mt-0.5">Complete Your Setup (Save 10%)</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Select items to include in your studio bundle:</span>
                  </div>

                  {/* Horizontal / Grid Compact Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Main product (locked) */}
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-surface/80 p-3 relative">
                      <span className="absolute top-2 right-2 bg-foreground text-background text-[8px] font-extrabold rounded-full px-1.5 py-0.5 uppercase tracking-wider">
                        THIS ITEM
                      </span>
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-hairline"
                      />
                      <div className="flex-1 min-w-0 pr-12">
                        <div className="text-xs font-bold text-foreground truncate">{product.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{product.subtitle}</div>
                        <div className="mt-0.5 text-xs font-bold text-foreground">${product.price.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Bundle items */}
                    {bundleItems.map((item, idx) => {
                      const isChecked = selectedBundleIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() =>
                            setSelectedBundleIds((prev) =>
                              isChecked ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                            )
                          }
                          className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-all ${
                            isChecked
                              ? "border-foreground bg-surface shadow-xs"
                              : "border-hairline bg-background hover:border-foreground/30 opacity-75"
                          }`}
                        >
                          <img
                            src={item.img}
                            alt={item.name}
                            className={`h-12 w-12 rounded-xl object-cover shrink-0 border border-hairline transition-opacity ${!isChecked ? "opacity-60" : ""}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">${item.price.toLocaleString()}</span>
                              {isChecked && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-1.5 py-0.2">−10%</span>
                              )}
                            </div>
                          </div>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? "border-foreground bg-foreground" : "border-hairline bg-background"}`}>
                            {isChecked && <Check className="h-2.5 w-2.5 text-background" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bundle CTA Summary Bar */}
                  <div className="border-t border-hairline pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs text-muted-foreground font-semibold">Combined Bundle Total:</span>
                      <span className="text-xl font-bold text-foreground">${bundleTotal.toLocaleString()}</span>
                      {selectedBundleIds.length > 0 && (
                        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-500/10 rounded-full px-2 py-0.5">
                          10% discount applied
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleAddBundleToCart}
                      className="w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold shadow-sm"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                      Add Bundle to Studio Bag
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Verified Reviews ── */}
            {activeTab === "reviews" && (
              <div className="w-full space-y-6">
                {product.reviews.length === 0 ? (
                  <div className="rounded-2xl border border-hairline bg-background p-12 text-center space-y-3">
                    <Star className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">No Reviews Yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Be the first to review this product after purchase via your order history.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating Summary Header */}
                    {(() => {
                      const totalCount = product.reviews.length || product.reviewsCount;
                      const avgRating =
                        product.reviews.length > 0
                          ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
                          : product.rating;

                      return (
                        <div className="rounded-2xl border border-hairline bg-background p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                          {/* Average Score */}
                          <div className="text-center shrink-0">
                            <div className="text-5xl font-bold text-foreground leading-none">
                              {avgRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-0.5 mt-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-hairline"}`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-semibold">{totalCount} reviews</div>
                          </div>

                          {/* Distribution bars */}
                          <div className="flex-1 w-full space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = product.reviews.filter((r) => r.rating === star).length;
                              const pct = product.reviews.length > 0 ? Math.round((count / product.reviews.length) * 100) : 0;
                              return (
                                <div key={star} className="flex items-center gap-2.5 text-xs">
                                  <span className="w-4 text-right font-semibold text-muted-foreground shrink-0">{star}</span>
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                                  <div className="flex-1 h-1.5 rounded-full bg-surface border border-hairline overflow-hidden">
                                    <div
                                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-muted-foreground shrink-0">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Individual Review Cards & Pagination */}
                    {(() => {
                      const REVIEWS_PER_PAGE = 5;
                      const totalPages = Math.ceil(product.reviews.length / REVIEWS_PER_PAGE) || 1;
                      const currentPage = Math.min(reviewsPage, totalPages);
                      const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
                      const paginatedReviews = product.reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

                      return (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {paginatedReviews.map((rev) => (
                              <div
                                key={rev.id}
                                className="rounded-2xl border border-hairline bg-background p-5 sm:p-6 shadow-xs space-y-4 hover:border-foreground/20 transition-all"
                              >
                                {/* Review Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {/* Avatar / Initials */}
                                    <div className="h-9 w-9 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center shrink-0">
                                      {rev.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-foreground">{rev.author}</div>
                                      <div className="text-[11px] text-muted-foreground mt-0.5">{rev.date}</div>
                                    </div>
                                  </div>
                                  {/* Star Rating */}
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-4 w-4 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Title + Comment */}
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">{rev.title}</h4>
                                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                                </div>

                                {/* Media (if exists) */}
                                {rev.mediaUrl && (
                                  <div className="space-y-2">
                                    <img
                                      src={rev.mediaUrl}
                                      alt={rev.mediaCaption || "Review photo"}
                                      className="w-full max-w-xs rounded-xl border border-hairline object-cover aspect-video"
                                    />
                                    {rev.mediaCaption && (
                                      <p className="text-[11px] text-muted-foreground italic">{rev.mediaCaption}</p>
                                    )}
                                  </div>
                                )}

                                {/* Helpful footer */}
                                <div className="flex items-center justify-between pt-1 border-t border-hairline">
                                  <span className="text-[11px] text-muted-foreground">Was this review helpful?</span>
                                  <div className="flex items-center gap-2">
                                    <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-full border border-hairline hover:border-foreground/30 cursor-pointer">
                                      Yes
                                    </button>
                                    <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-full border border-hairline hover:border-foreground/30 cursor-pointer">
                                      No
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Clean Pagination Bar (Only when total items > 5) */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-hairline pt-4 mt-6">
                              <span className="text-xs text-muted-foreground font-semibold">
                                Showing {startIndex + 1}–{Math.min(startIndex + REVIEWS_PER_PAGE, product.reviews.length)} of {product.reviews.length} reviews
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                    currentPage === 1
                                      ? "border-hairline bg-surface text-muted-foreground/50 cursor-not-allowed"
                                      : "border-hairline bg-background text-foreground hover:bg-surface cursor-pointer"
                                  }`}
                                >
                                  Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    onClick={() => setReviewsPage(pageNum)}
                                    className={`h-7 w-7 text-xs font-bold rounded-full transition-all cursor-pointer ${
                                      currentPage === pageNum
                                        ? "bg-foreground text-background"
                                        : "bg-background text-muted-foreground hover:text-foreground border border-hairline"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={currentPage === totalPages}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                    currentPage === totalPages
                                      ? "border-hairline bg-surface text-muted-foreground/50 cursor-not-allowed"
                                      : "border-hairline bg-background text-foreground hover:bg-surface cursor-pointer"
                                  }`}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

      </div>



      {/* Shared Global Footer */}
      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirmSignOut={() => navigate({ to: "/auth" })}
      />
      <AIShoppingAssistant
        onAddToCart={handleAddToCart}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}
