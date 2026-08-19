import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Truck,
  Star,
  Check,
  ArrowLeft,
  Share2,
  SlidersHorizontal,
  Menu,
  X,
  LogOut,
  LogIn,
  User,
  Search,
} from "lucide-react";
import { CATALOG_PRODUCTS, CatalogProduct } from "../lib/products.data";
import { useCart } from "../context/cart-context";
import { Button } from "../components/ui/button";
import { Footer } from "../components/layout/Footer";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/use-auth-user";
import { supabase } from "@/integrations/supabase/client";
import { SignUpNoticeModal } from "@/components/SignUpNoticeModal";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";

interface AIRecommendation {
  product: CatalogProduct;
  matchScore: number;
  aiReason: string;
}

function getAIRecommendedProducts(
  wishlist: CatalogProduct[],
  allProducts: CatalogProduct[],
  limit = 3
): AIRecommendation[] {
  const wishlistIds = new Set(wishlist.map((p) => p.id));
  const available = allProducts.filter((p) => !wishlistIds.has(p.id));

  if (available.length === 0) return [];

  const savedCategories = new Set(wishlist.map((p) => p.category));

  const styleCounts: Record<string, number> = {};
  wishlist.forEach((p) => {
    const style = p.attributes?.workspaceStyle;
    if (style) styleCounts[style] = (styleCounts[style] || 0) + 1;
  });
  const dominantStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const scored = available.map((product) => {
    let score = 78;
    let reason = "AI Recommended Studio Essential";

    const isNewCategory = !savedCategories.has(product.category);
    if (wishlist.length > 0 && isNewCategory) {
      score += 12;
      const primarySaved = wishlist[0];
      reason = `Pairs with your saved ${primarySaved.name}`;
    } else if (wishlist.length > 0) {
      reason = `Matches your saved ${product.category} preferences`;
    }

    if (dominantStyle && product.attributes?.workspaceStyle === dominantStyle) {
      score += 6;
      if (wishlist.length > 0 && isNewCategory) {
        reason = `Matches your ${dominantStyle} workspace aesthetic`;
      }
    }

    if (product.rating >= 4.8) score += 3;
    if (product.isBestSeller) score += 2;

    const matchScore = Math.min(99, Math.max(86, score));

    return {
      product,
      matchScore,
      aiReason: reason,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Wishlist — Northlane Workspace" },
      { name: "description", content: "Your saved studio equipment and curated workspace wishlist items." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuthUser();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { addToCart, setIsOpen: openCartDrawer, itemCount } = useCart();
  const navigate = useNavigate();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("northlane_wishlist_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

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

  const wishlistProducts = CATALOG_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const categories = ["All", ...Array.from(new Set(wishlistProducts.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === "All"
      ? wishlistProducts
      : wishlistProducts.filter((p) => p.category === selectedCategory);

  const totalWishlistValue = wishlistProducts.reduce((sum, p) => sum + p.price, 0);

  const handleRemoveFromWishlist = async (productId: string, name: string) => {
    const updated = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(updated);
    toast.info(`Removed ${name} from your saved wishlist`);
    if (user) {
      try {
        await (supabase as any)
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } catch (e) {}
    }
  };

  const handleAddToCart = (product: CatalogProduct) => {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.img,
      category: product.category,
      stockCount: product.stockCount,
      quantity: 1,
    });
  };

  const handleMoveAllToBag = () => {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    if (wishlistProducts.length === 0) return;
    wishlistProducts.forEach((p) => {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.img,
        category: p.category,
        stockCount: p.stockCount,
        quantity: 1,
      });
    });
    toast.success(`Moved all ${wishlistProducts.length} saved item(s) to your studio bag!`);
    openCartDrawer(true);
  };

  const aiRecommendations = getAIRecommendedProducts(wishlistProducts, CATALOG_PRODUCTS, 3);

  function formatPrice(amount: number): string {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Navigation Header matching Shop & Landing */}
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
                className="relative flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <div className="relative">
                  <Heart className="h-4 w-4 text-foreground" />
                  {wishlistProducts.length > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                      {wishlistProducts.length}
                    </span>
                  )}
                </div>
              </Link>

              <button
                onClick={() => openCartDrawer(true)}
                className="relative flex items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label="Studio Bag"
                title="Studio Bag"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {itemCount > 0 && (
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
                      onClick={async () => {
                        await supabase.auth.signOut();
                        toast.success("Signed out successfully");
                      }}
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
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-accent">
                Saved Wishlist ({wishlistProducts.length})
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
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="bg-surface/50 border-b border-hairline py-8 sm:py-12">
          <div className="container-editorial">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Saved Studio Configuration
              </span>
              <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Studio Wishlist
                {wishlistProducts.length > 0 && (
                  <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-bold text-accent">
                    {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"}
                  </span>
                )}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
                Keep track of your favorite Northlane workspace gear, compare specs, and easily transfer saved equipment straight to your studio bag.
              </p>
            </div>
          </div>
        </section>

        {/* Wishlist Main Catalog Grid */}
        <main className="container-editorial py-8 sm:py-12">
          {wishlistProducts.length === 0 ? (
            <div className="py-16 sm:py-24 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-2">
                Saved Equipment
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">Your wishlist is empty</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                Browse our catalog and click the heart icon on any item to save it to your personal studio setup list.
              </p>
              <button
                onClick={() => navigate({ to: "/shop" })}
                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-300 hover:bg-foreground/90 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>Explore Shop Catalog</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Organized Toolbar: Filters + Wishlist Summary & Bulk Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/40 border border-hairline rounded-2xl p-4 shadow-2xs">
                {/* Left: Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                  <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">Filter:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer shrink-0 border ${
                        selectedCategory === cat
                          ? "bg-foreground text-background border-foreground shadow-xs"
                          : "bg-background border-hairline text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Right: Total Value & Bulk Action Button */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total Wishlist Value: </span>
                    <span className="font-bold text-foreground">{formatPrice(totalWishlistValue)}</span>
                  </div>

                  <Button
                    onClick={handleMoveAllToBag}
                    size="sm"
                    className="rounded-full text-xs font-bold px-4.5 py-2 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Move All to Studio Bag
                  </Button>
                </div>
              </div>

              {/* Product Grid Matching /shop Card Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="group rounded-2xl border border-hairline bg-surface/40 p-5 transition-all duration-300 hover:border-foreground/20 hover:bg-surface/80 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-background aspect-[4/3] mb-3">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <button
                          onClick={() => handleRemoveFromWishlist(p.id, p.name)}
                          aria-label={`Remove ${p.name}`}
                          title="Remove from wishlist"
                          className="absolute right-2 top-2 sm:right-3 sm:top-3 grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-surface/90 backdrop-blur border border-hairline text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      {/* Brand Tag & Rating */}
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-accent font-bold uppercase tracking-wider">
                        <span className="truncate">{p.brand}</span>
                        <span className="text-amber-500 font-bold shrink-0 ml-1">★ {p.rating}</span>
                      </div>

                      {/* Title & Description */}
                      <Link to="/products/$productId" params={{ productId: p.id }} className="block mt-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                          {p.name}
                        </h3>
                      </Link>

                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.subtitle}
                      </p>
                    </div>

                    {/* Price & Action Button Footer */}
                    <div className="mt-5 border-t border-hairline pt-4 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Price</span>
                        <span className="text-base font-bold text-foreground tracking-tight">
                          {formatPrice(p.price)}
                        </span>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(p)}
                        size="sm"
                        className="rounded-full px-4 text-xs font-bold cursor-pointer"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Add to Bag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommended Curated Gear */}
              {aiRecommendations.length > 0 && (
                <div className="border-t border-hairline pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Recommendation Engine</span>
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Complete Your Studio Configuration
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Smart recommendations generated based on your saved products and setup profile.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="text-xs font-bold text-foreground hover:text-accent transition-colors flex items-center gap-1 shrink-0"
                    >
                      View Full Catalog <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {aiRecommendations.map(({ product: p, matchScore, aiReason }) => (
                      <div
                        key={p.id}
                        className="group rounded-2xl border border-hairline bg-surface/30 p-4 flex flex-col justify-between hover:border-foreground/20 hover:bg-surface/50 transition-all shadow-2xs"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl border border-hairline bg-background overflow-hidden shrink-0">
                            <img src={p.img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                                {matchScore}% Match
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">{p.category}</span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate">{p.name}</h4>
                            <p className="text-[11px] font-semibold text-foreground">{formatPrice(p.price)}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-hairline/60 flex items-center justify-between gap-2">
                          <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{aiReason}</p>
                          <Link
                            to="/products/$productId"
                            params={{ productId: p.id }}
                            className="text-[11px] font-bold text-accent hover:underline shrink-0 flex items-center gap-0.5"
                          >
                            <span>Explore</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <AIShoppingAssistant
        onAddToCart={(p: any) => {
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
        }}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}
