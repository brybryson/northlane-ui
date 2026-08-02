import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/shop")({
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
  const { addToCart, setIsOpen: openCartDrawer, itemCount: totalCartCount } = useCart();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    setWishlistIds((prev) => 
      prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
    );
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
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back Home
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
                className="relative flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-foreground/30 transition shadow-xs cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Studio Bag</span> ({totalCartCount})
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
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await supabase.auth.signOut();
                    toast.success("Signed out successfully");
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted/30"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </header>

        {/* Compact & Mobile-Friendly Shop Header */}
        <section className="bg-surface border-b border-hairline py-6 sm:py-10 lg:py-12">
          <div className="container-editorial">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
              <div>
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  Studio Catalog
                </div>
                <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Workspace Essentials
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Explore carefully engineered mechanical keyboards, acoustic monitors, ergonomic
                  chairs, and solid wood desks.
                </p>
              </div>

              {/* Compact Natural Language Search Bar */}
              <div className="relative w-full md:w-80 lg:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products or try 'keyboard'..."
                  className="w-full rounded-full border border-hairline bg-background pl-9 pr-9 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Catalog & Filters Section */}
        <section className="container-editorial py-6 sm:py-12">
          {/* Category Filter Pills (No Scrollbar — Clean Wrapping Grid/Flex Layout) */}
          <div className="mb-6 flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] transition-all border ${
                  selectedCategory === cat
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "border-hairline bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground"
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
              {(selectedPersona !== "All" || selectedBadge !== "All" || maxPrice < 7500 || sortBy !== "featured") && (
                <span className="ml-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {(selectedPersona !== "All" ? 1 : 0) + (selectedBadge !== "All" ? 1 : 0) + (maxPrice < 7500 ? 1 : 0) + (sortBy !== "featured" ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters & Sorting Toolbar (Responsive Stack on Mobile) */}
          <div className={`mb-6 ${filtersExpanded ? "flex" : "hidden sm:flex"} flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-6 rounded-2xl sm:rounded-3xl border border-hairline bg-surface/60 p-3.5 sm:p-6 backdrop-blur-xs`}>
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
                  Max: <strong className="text-foreground">₱{maxPrice.toLocaleString()}</strong>
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
                }}
                className="font-semibold text-accent hover:underline text-[11px] sm:text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Product Cards Grid (Optimized 2-column on Mobile view, 3-col on tablet, 4-col on desktop) */}
          {filteredProducts.length === 0 ? (
            <div className="my-12 rounded-[2rem] border border-hairline bg-surface p-8 sm:p-12 text-center shadow-sm">
              <h3 className="text-lg font-bold text-foreground">No matching products found</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
                Try adjusting your search criteria or resetting filters to explore our complete
                studio catalog.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPersona("All");
                  setSelectedBadge("All");
                  setSearchQuery("");
                  setMaxPrice(7500);
                }}
                className="mt-6 rounded-full px-6 py-2.5 text-xs font-bold"
              >
                View Full Catalog
              </Button>
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
                        ₱{p.price.toLocaleString()}
                      </div>
                      {p.originalPrice && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                          ₱{p.originalPrice.toLocaleString()}
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
                      ₱{quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₱{quickViewProduct.originalPrice.toLocaleString()}
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
                      <ShoppingBag className="h-4 w-4 mr-1.5" /> Add · ₱
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
      <AIShoppingAssistant
        onAddToCart={handleAddToCart}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
        user={user}
      />
    </div>
  );
}

