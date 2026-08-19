import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Star,
  X,
  Eye,
  ShoppingBag,
  ArrowLeft,
  Menu,
  Heart,
  User,
  LogOut,
  LogIn,
  RotateCcw,
  Sparkles,
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

type ShopSearch = {
  q?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      q: search.q ? String(search.q) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Studio Catalog — Northlane Workspace Essentials" },
      {
        name: "description",
        content:
          "Explore our full studio catalog of quiet mechanical keyboards, acoustic headphones, ergonomic seating, and solid wood standing desks.",
      },
      { property: "og:title", content: "Shop Studio Catalog — Northlane Workspace Essentials" },
      {
        property: "og:description",
        content:
          "Curated workspace essentials for developers, designers, content creators, and remote professionals.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { user } = useAuthUser();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const { addToCart, setIsOpen: openCartDrawer, itemCount: totalCartCount } = useCart();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setSearchQuery(searchParams.q);
    }
  }, [searchParams.q]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPersona, setSelectedPersona] = useState<string>("All");
  const [selectedBadge, setSelectedBadge] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(7500);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">(
    "featured",
  );
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogProduct | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const wishlistCount = wishlistIds.length;
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const categories: string[] = [
    "All",
    "Keyboards",
    "Mouse",
    "Audio",
    "Monitors",
    "Desks",
    "Seating",
    "Desk Accessories",
    "Creator Gear",
    "Smart Office",
    "Power",
  ];

  const personas = [
    "All",
    "Developers",
    "Designers",
    "Gamers",
    "Content Creators",
    "Office Workers",
  ];
  const badges = ["All", "Best Seller", "New Arrival", "On Sale", "Staff Pick"];

  useEffect(() => {
    const syncWishlist = () => {
      try {
        const saved = localStorage.getItem("northlane_wishlist");
        if (saved) {
          setWishlistIds(JSON.parse(saved));
        } else {
          setWishlistIds([]);
        }
      } catch {
        setWishlistIds([]);
      }
    };
    syncWishlist();
    window.addEventListener("northlane_wishlist_updated", syncWishlist);
    return () => {
      window.removeEventListener("northlane_wishlist_updated", syncWishlist);
    };
  }, [user]);

  function handleAddToCart(product: CatalogProduct, qty: number = 1) {
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
      quantity: qty,
    });
  }

  function onToggleWishlist(p: CatalogProduct) {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    setWishlistIds((prev) => {
      const updated = prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id];
      try {
        localStorage.setItem("northlane_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  // Natural Language & Filtering Logic
  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((p) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.attributes.bestFor.some((b) => b.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Category Filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }

      // Persona Filter
      if (
        selectedPersona !== "All" &&
        !p.attributes.bestFor.includes(selectedPersona as (typeof p.attributes.bestFor)[number])
      ) {
        return false;
      }

      // Collection Badge Filter
      if (selectedBadge !== "All" && p.attributes.badge !== selectedBadge) {
        return false;
      }

      // Price Filter
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, selectedPersona, selectedBadge, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      {/* Navigation Header */}
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
              <button
                type="button"
                onClick={() => {
                  const searchEl = document.getElementById("shop-search-input");
                  if (searchEl) {
                    searchEl.focus();
                    searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Search Catalog"
                title="Search Catalog"
              >
                <Search className="h-4 w-4" />
              </button>

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
                onClick={() => openCartDrawer(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Studio Bag"
                title="Studio Bag"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {totalCartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {totalCartCount}
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

        {/* Compact Editorial Shop Header */}
        <section className="bg-surface/40 border-b border-hairline py-4 sm:py-6">
          <div className="container-editorial">
            <div className="max-w-2xl text-left">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                Studio Catalog
              </div>
              <h1 className="mt-0.5 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Workspace Essentials
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Explore carefully engineered mechanical keyboards, acoustic monitors, ergonomic
                seating, and solid wood desks.
              </p>
            </div>
          </div>
        </section>

        {/* Main Catalog & Controls Section */}
        <section className="container-editorial pt-4 pb-8 sm:pt-5 sm:pb-12">
          {/* Dedicated Studio Search Input Section (Positioned closer to top) */}
          <div className="mb-4 sm:mb-5 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-surface/90 rounded-full border border-hairline/80 p-1 shadow-sm focus-within:border-foreground/60 focus-within:bg-background transition-all duration-200 backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0 ml-1">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                id="shop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    navigate({ to: "/shop", search: { q: undefined } });
                  }
                }}
                placeholder="Search studio catalog for mechanical keyboards, precision mice, monitors..."
                className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    navigate({ to: "/shop", search: { q: undefined } });
                  }}
                  className="mr-1.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Styled matching Landing Page Featured Essentials) */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-foreground text-background"
                    : "border border-hairline bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Collapsible Mobile Filters Button */}
          <div className="sm:hidden mb-4 flex items-center justify-between gap-2">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex-1 flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface/80 px-4 py-2.5 text-xs font-semibold text-foreground transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
              {filtersExpanded ? "Hide Filters" : "Show Filters & Refine"}
              {(selectedPersona !== "All" || selectedBadge !== "All" || maxPrice < 7500 || sortBy !== "featured" || searchQuery) && (
                <span className="ml-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {(selectedPersona !== "All" ? 1 : 0) + (selectedBadge !== "All" ? 1 : 0) + (maxPrice < 7500 ? 1 : 0) + (sortBy !== "featured" ? 1 : 0) + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters & Sorting Toolbar */}
          <div className={`mb-6 ${filtersExpanded ? "flex" : "hidden sm:flex"} flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-6 rounded-2xl sm:rounded-3xl border border-hairline bg-surface/60 p-3.5 sm:p-5 backdrop-blur-xs`}>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3 text-xs font-medium text-muted-foreground w-full sm:w-auto">
              <span className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5 text-accent" /> Refine:
              </span>

              {/* Persona Selector */}
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-hairline bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="All">All User Profiles</option>
                {personas.slice(1).map((p) => (
                  <option key={p} value={p}>
                    For {p}
                  </option>
                ))}
              </select>

              {/* Collection Badge Selector */}
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-hairline bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="All">All Collections</option>
                {badges.slice(1).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Max Price Range Slider */}
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-hairline pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-[11px] sm:text-xs">
                  Max: <strong className="text-foreground">${maxPrice.toLocaleString()}</strong>
                </span>
                <input
                  type="range"
                  min={200}
                  max={7500}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-1.5 w-24 accent-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-medium w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-muted-foreground text-[11px] sm:text-xs">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "featured" | "price-asc" | "price-desc" | "rating")
                }
                className="rounded-xl border border-hairline bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="featured">Featured Essentials</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredProducts.length}</strong> studio
              item(s)
            </span>
            {(selectedCategory !== "All" ||
              selectedPersona !== "All" ||
              selectedBadge !== "All" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPersona("All");
                  setSelectedBadge("All");
                  setSearchQuery("");
                  setMaxPrice(7500);
                  navigate({ to: "/shop", search: { q: undefined } });
                }}
                className="font-semibold text-accent hover:underline text-[11px] sm:text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Product Cards Grid & Empty Search State */}
          {filteredProducts.length === 0 ? (
            <div className="my-10 rounded-[2.5rem] border border-hairline bg-gradient-to-b from-surface via-background to-surface/80 p-8 sm:p-14 text-center shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                No workspace gear matching "{searchQuery || "your query"}"
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                We couldn't find any products matching your search criteria. Try checking spelling or resetting filters.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPersona("All");
                    setSelectedBadge("All");
                    setSearchQuery("");
                    setMaxPrice(7500);
                    navigate({ to: "/shop", search: { q: undefined } });
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold text-background hover:bg-foreground/90 transition shadow-md cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters & View Full Catalog
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[2rem] border border-hairline bg-surface p-3 sm:p-5 transition-all duration-300 hover:border-foreground/30 hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    {/* Clean Unique Image Container */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-background aspect-[4/3] mb-3">
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      <button
                        onClick={() => onToggleWishlist(p)}
                        aria-label="Add to wishlist"
                        className={`absolute right-2 top-2 sm:right-3 sm:top-3 grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full bg-surface/90 backdrop-blur transition active:scale-90 ${
                          wishlistIds.includes(p.id)
                            ? "text-accent fill-accent"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wishlistIds.includes(p.id) ? "fill-accent text-accent" : ""}`}
                        />
                      </button>

                      {/* Quick Inspect Button */}
                      <button
                        onClick={() => {
                          setQuickViewProduct(p);
                          setModalQuantity(1);
                        }}
                        className="absolute right-2 bottom-2 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-background/90 text-foreground opacity-90 sm:opacity-0 shadow-md backdrop-blur transition-all duration-300 group-hover:opacity-100 hover:scale-110"
                        aria-label="Quick Inspect"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    {/* Brand & Subdued Rating Line inside Card Body */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-accent font-bold uppercase tracking-wider">
                      <span className="truncate">{p.brand}</span>
                      <span className="text-amber-500 font-bold shrink-0 ml-1">★ {p.rating}</span>
                    </div>

                    <Link
                      to={`/products/$productId`}
                      params={{ productId: p.id }}
                      className="group-hover:text-accent transition-colors"
                    >
                      <h3 className="mt-1 text-xs sm:text-base font-bold text-foreground line-clamp-1">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground line-clamp-1 font-normal">
                      {p.subtitle}
                    </p>
                  </div>

                  {/* Price & Add Actions */}
                  <div className="mt-3 sm:mt-5 border-t border-hairline pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-lg font-bold text-foreground">
                        ${p.price.toLocaleString()}
                      </div>
                      {p.originalPrice && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                          ${p.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/products/$productId`}
                        params={{ productId: p.id }}
                        className="hidden sm:inline-flex rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-background transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(p, 1)}
                        className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-foreground text-background transition hover:bg-foreground/90 active:scale-95 shadow-xs"
                        aria-label={`Add ${p.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      {/* Luxury Responsive Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-hairline bg-background p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid gap-6 sm:grid-cols-2 items-center">
              {/* Image Frame */}
              <div>
                <div className="relative overflow-hidden rounded-2xl bg-surface aspect-[4/3] shadow-md">
                  <img
                    src={quickViewProduct.img}
                    alt={quickViewProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Information & Purchasing Options */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-accent uppercase tracking-wider">
                    <span>
                      {quickViewProduct.category} · {quickViewProduct.brand}
                    </span>
                    <span className="text-amber-500 font-bold">★ {quickViewProduct.rating}</span>
                  </div>

                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-foreground">
                    {quickViewProduct.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">{quickViewProduct.subtitle}</p>

                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-foreground">
                      ${quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${quickViewProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {quickViewProduct.description}
                  </p>
                </div>

                {/* Quantity Controls & Add Action */}
                <div className="mt-6 border-t border-hairline pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Select Quantity:</span>
                    <div className="flex items-center rounded-full border border-hairline bg-surface p-1">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="grid h-6 w-6 place-items-center rounded-full text-foreground hover:bg-background transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-foreground">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="grid h-6 w-6 place-items-center rounded-full text-foreground hover:bg-background transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        handleAddToCart(quickViewProduct, modalQuantity);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 rounded-full py-5 text-xs font-bold shadow-md"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1.5" /> Add · $
                      {(quickViewProduct.price * modalQuantity).toLocaleString()}
                    </Button>
                    <Link
                      to={`/products/$productId`}
                      params={{ productId: quickViewProduct.id }}
                      onClick={() => setQuickViewProduct(null)}
                      className="rounded-full border border-hairline px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-surface transition"
                    >
                      Specs &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Shared Global Footer */}
      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <SignOutConfirmModal isOpen={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
      <AIShoppingAssistant
        onAddToCart={handleAddToCart}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}

