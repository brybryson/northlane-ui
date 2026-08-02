import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Star,
  Plus,
  Compass,
  Send,
  Check,
  Menu,
  X,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  Building2,
  CheckCircle2,
  Layers,
  Award,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { listJournalPosts, listCustomerStories } from "@/lib/cms.functions";
import { useAuthUser } from "@/hooks/use-auth-user";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SignUpNoticeModal } from "@/components/SignUpNoticeModal";
import { AIShoppingAssistant } from "@/components/AIShoppingAssistant";
import { AISetupStager } from "@/components/AISetupStager";
import { useCart } from "@/context/cart-context";

import heroWorkspace from "@/assets/hero-workspace.jpg";
import productKeyboard from "@/assets/product-keyboard.jpg";
import productMouse from "@/assets/product-mouse.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLamp from "@/assets/product-lamp.jpg";
import lifestyleDesigner from "@/assets/lifestyle-designer.jpg";
import lifestyleDeveloper from "@/assets/lifestyle-developer.jpg";
import lifestyleHome from "@/assets/lifestyle-home.jpg";
import collectionFurniture from "@/assets/collection-furniture.jpg";
import collectionAccessories from "@/assets/collection-accessories.jpg";
import storyPortrait from "@/assets/story-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northlane — Quiet Focus Workspace Essentials & Creator Gear" },
      {
        name: "description",
        content:
          "Curated mechanical keyboards, acoustic studio monitors, and precision desk tools engineered for quiet focus.",
      },
      { property: "og:title", content: "Northlane — Quiet Focus Workspace Essentials" },
      {
        property: "og:description",
        content:
          "Curated workspace essentials designed for professionals who value ergonomics and timeless minimalism.",
      },
    ],
  }),
  component: Landing,
});

/* ---------------------------------- Shared --------------------------------- */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 active:scale-[0.98]";
  const variants = {
    primary:
      "bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    secondary:
      "border border-border bg-surface text-foreground hover:border-foreground/40 hover:bg-muted/50",
    outline:
      "border border-foreground/20 text-foreground hover:bg-foreground hover:text-background",
    ghost: "text-foreground hover:text-accent hover:bg-muted/40",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ------------------------------------ Nav ---------------------------------- */

function Nav({
  cartCount,
  wishlistCount,
  onOpenCart,
  onShowSignUpNotice,
}: {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onShowSignUpNotice: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthUser();
  const { setIsOpen, itemCount } = useCart();

  const links = [
    { label: "Shop", href: "/shop", isRoute: true },
    { label: "Collections", href: "#collections" },
    { label: "Concierge", href: "#concierge" },
    { label: "Workspaces", href: "#workspaces" },
    { label: "Journal", href: "#journal" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-xl transition-all duration-300">
        <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
          <Link
            to="/"
            className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
            <span>Northlane</span>
          </Link>

          <nav className="hidden justify-center gap-8 lg:flex">
            {links.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              ),
            )}
          </nav>

          <div className="hidden items-center justify-end gap-2 lg:flex">
            <IconBtn label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              label="Wishlist"
              onClick={() => {
                if (!user) {
                  onShowSignUpNotice();
                } else {
                  toast.info(`Wishlist contains ${wishlistCount} saved item(s)`);
                }
              }}
            >
              <div className="relative">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </IconBtn>
            <IconBtn label="Cart" onClick={() => setIsOpen(true)}>
              <div className="relative">
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {itemCount}
                  </span>
                )}
              </div>
            </IconBtn>

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

            <Link
              to="/shop"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-foreground/90 hover:shadow-sm"
            >
              Shop Catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenCart}
              className="relative p-2 text-muted-foreground hover:text-foreground animate-none"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-foreground transition hover:bg-muted"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sticky top-[61px] z-40 overflow-hidden border-b border-hairline bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-editorial py-6 space-y-4">
              <nav className="flex flex-col space-y-3">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-lg font-medium text-foreground transition hover:text-accent"
                  >
                    <span>{l.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-hairline flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  Search products or workspace edits...
                </button>
                <a
                  href="#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background"
                >
                  Explore Collections <ArrowRight className="h-4 w-4" />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-hairline bg-background p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex flex-1 items-center gap-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keyboard, headphones, desk accessories..."
                    className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                  Suggested Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Aster 65 Keyboard",
                    "Nordic Wireless Mouse",
                    "Focus Desk Walnut",
                    "Halo Headphones",
                    "Brass Desk Lamp",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        toast.info(`Searching for "${term}"`);
                        setSearchOpen(false);
                      }}
                      className="rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
    >
      {children}
    </button>
  );
}

/* ----------------------------------- Hero ---------------------------------- */

function Hero({ onAddToCart }: { onAddToCart: (p: ProductItem) => void }) {
  return (
    <section className="container-editorial pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Centered Editorial Header */}
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            <span>Winter Collection · 2026</span>
            <span className="h-3 w-px bg-hairline" />
            <span className="text-muted-foreground font-normal">Copenhagen Studio</span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
            Workspace essentials <br className="hidden sm:block" />
            engineered for quiet focus.
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-4xl text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Curated mechanical keyboards, acoustic studio monitors, and precision desk tools crafted
            for professionals who value ergonomics and timeless minimalism.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link to="/shop">
              <Button className="shadow-md hover:shadow-lg font-medium">
                Explore Shop Catalog <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="#concierge">
              <Button variant="secondary" className="font-medium">
                <Compass className="h-4 w-4 text-accent" />
                Studio Concierge
              </Button>
            </a>
          </div>
        </Reveal>
      </div>

      {/* Main Studio Workspace Showcase Image (Clean, Spacious & De-cluttered) */}
      <Reveal delay={0.15}>
        <div className="relative mt-12 sm:mt-16 overflow-hidden rounded-[2.5rem] border border-hairline bg-surface shadow-2xl">
          <img
            src={heroWorkspace}
            alt="Northlane Studio Workspace Setup"
            className="h-[420px] sm:h-[560px] lg:h-[640px] w-full object-cover object-center transition-transform duration-1000 hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Floating Overlay Badge on Bottom Left */}
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm rounded-2xl border border-white/20 bg-background/90 p-5 shadow-xl backdrop-blur-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Featured Studio Staging
            </div>
            <div className="mt-1 text-base font-bold text-foreground">
              The Focus Desk — Solid Walnut
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>7 studio pieces included</span>
              <span className="font-bold text-foreground">from ₱64,950</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Trusted Studios ----------------------------- */

function Trusted() {
  const brands = [
    "HERMAN MILLER",
    "LOGITECH MX",
    "KEYCHRON",
    "GROVEMADE",
    "SONOS",
    "BANG & OLUFSEN",
    "TEENAGE ENGINEERING",
    "LEICA STUDIO",
  ];

  const marqueeItems = [...brands, ...brands, ...brands];

  return (
    <div className="hairline-t hairline-b bg-surface/40 py-7 overflow-hidden relative">
      {/* Side Fade Gradient Overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-background to-transparent" />

      {/* Sleek Infinite Scrolling Brand Ticker */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 py-1">
          {marqueeItems.map((brand, i) => (
            <div key={`${brand}-${i}`} className="flex items-center gap-10 shrink-0 select-none">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/80 transition-colors duration-300 hover:text-foreground cursor-default">
                {brand}
              </span>
              <span className="h-1 w-1 rounded-full bg-accent/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Collections ------------------------------ */

const collections = [
  {
    title: "Workspace Furniture",
    desc: "Desks, chairs, and shelving engineered for longevity.",
    img: collectionFurniture,
    colSpan: "lg:col-span-2",
    tag: "32 items",
  },
  {
    title: "Mechanical Keyboards",
    desc: "Tactile, silent, and endlessly customizable.",
    img: productKeyboard,
    colSpan: "lg:col-span-1",
    tag: "18 items",
  },
  {
    title: "Acoustic Audio",
    desc: "Headphones and monitors for deep focus.",
    img: productHeadphones,
    colSpan: "lg:col-span-1",
    tag: "15 items",
  },
  {
    title: "Creator Studio",
    desc: "Color-accurate lighting and studio capture setups.",
    img: lifestyleDesigner,
    colSpan: "lg:col-span-2",
    tag: "21 items",
  },
  {
    title: "Desk Accessories",
    desc: "Refined details that complete your setup.",
    img: collectionAccessories,
    colSpan: "lg:col-span-2",
    tag: "45 items",
  },
  {
    title: "Productivity Tools",
    desc: "Precision gear designed to sharpen your daily flow.",
    img: productMouse,
    colSpan: "lg:col-span-1",
    tag: "24 items",
  },
];

function Collections() {
  return (
    <section id="collections" className="container-editorial py-20 lg:py-28">
      <Reveal>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">Curated Edits</div>
            <h2 className="headline max-w-2xl text-4xl lg:text-5xl">
              Six collections, thoughtfully composed.
            </h2>
          </div>
          <a
            href="#products"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            View all categories
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </Reveal>

      {/* Seamless Bento Grid with 0 Empty Space */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05} className={c.colSpan}>
            <a
              href="#products"
              className="group relative flex h-full min-h-[300px] sm:min-h-[340px] lg:min-h-[380px] w-full flex-col justify-between overflow-hidden rounded-[2.2rem] border border-hairline bg-surface p-6 sm:p-8 transition-all duration-500 hover:border-foreground/40 hover:shadow-2xl"
            >
              {/* Full Bleed Image Background */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium backdrop-blur">
                  {c.tag}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 p-6">
                <div>
                  <h3 className="text-lg font-medium">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
                <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline text-muted-foreground transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Products --------------------------------- */

interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  rating: number;
  img: string;
  badge?: string;
  category: string;
  description: string;
}

const products: ProductItem[] = [
  {
    id: "p1",
    name: "Aster 65 Keyboard",
    subtitle: "Silent tactile · Solid Walnut Base",
    price: 9450,
    rating: 4.9,
    img: productKeyboard,
    badge: "Bestseller",
    category: "Keyboards",
    description:
      "Crafted with double-shot keycaps, hot-swappable tactile switches, and a solid walnut frame for whisper-quiet typing.",
  },
  {
    id: "p2",
    name: "Nordic Wireless Mouse",
    subtitle: "Ergonomic · Matte Graphite",
    price: 6450,
    rating: 4.8,
    img: productMouse,
    badge: "Editor's Pick",
    category: "Mouse",
    description:
      "Sculpted for long hours of precision work. Features dual Bluetooth 5.3 connectivity and a 70-day rechargeable battery.",
  },
  {
    id: "p3",
    name: "Halo Studio Headphones",
    subtitle: "Active Noise Cancelling · Memory Foam",
    price: 17450,
    rating: 4.9,
    img: productHeadphones,
    badge: "New Release",
    category: "Audio",
    description:
      "Immersive spatial audio combined with adaptive ANC to create an isolated acoustic zone in any studio or home office.",
  },
  {
    id: "p4",
    name: "Meridian Desk Lamp",
    subtitle: "Warm Dimmable · Brushed Brass",
    price: 10950,
    rating: 4.7,
    img: productLamp,
    category: "Lighting",
    description:
      "Architectural lamp with smooth touch dimming, 2700K warm LED illumination, and an adjustable swivel arm.",
  },
];

function Featured({
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}: {
  onAddToCart: (p: ProductItem) => void;
  onToggleWishlist: (p: ProductItem) => void;
  wishlistIds: string[];
}) {
  const [selectedCat, setSelectedCat] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  const categories = ["All", "Keyboards", "Audio", "Lighting", "Accessories"];

  const filteredProducts =
    selectedCat === "All" ? products : products.filter((p) => p.category === selectedCat);

  return (
    <section id="products" className="hairline-t">
      <div className="container-editorial py-20 lg:py-28">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Featured Essentials</div>
              <h2 className="headline max-w-2xl text-4xl lg:text-5xl">
                Quiet favorites, <br />
                crafted for daily use.
              </h2>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    selectedCat === cat
                      ? "bg-foreground text-background"
                      : "border border-hairline bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((p, i) => {
            const isWishlisted = wishlistIds.includes(p.id);
            return (
              <Reveal key={p.id} delay={i * 0.05}>
                <div className="group flex flex-col h-full">
                  <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold tracking-wide uppercase backdrop-blur text-foreground">
                        {p.badge}
                      </span>
                    )}

                    <button
                      onClick={() => onToggleWishlist(p)}
                      aria-label="Add to wishlist"
                      className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 backdrop-blur transition active:scale-90 ${
                        isWishlisted
                          ? "text-accent fill-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${isWishlisted ? "fill-accent text-accent" : ""}`}
                      />
                    </button>

                    <button
                      onClick={() => setQuickViewProduct(p)}
                      className="absolute inset-x-3 bottom-3 rounded-full bg-foreground/95 py-2.5 text-xs font-medium text-background opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 shadow-md hover:bg-foreground"
                    >
                      Quick View
                    </button>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-medium leading-tight">{p.name}</h3>
                        <div className="text-[15px] font-semibold">₱{p.price.toLocaleString()}</div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.subtitle}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {p.rating}
                      </div>

                      <button
                        onClick={() => onAddToCart(p)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-1.5 text-xs font-medium transition hover:border-foreground hover:bg-foreground hover:text-background"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-hairline bg-background p-6 md:p-8 shadow-2xl"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="overflow-hidden rounded-2xl bg-muted aspect-square">
                  <img
                    src={quickViewProduct.img}
                    alt={quickViewProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="eyebrow mb-2">{quickViewProduct.category}</div>
                  <h3 className="text-2xl font-bold">{quickViewProduct.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{quickViewProduct.subtitle}</p>
                  <div className="mt-4 text-2xl font-semibold">${quickViewProduct.price}</div>
                  <div className="mt-4 text-2xl font-semibold">
                    ₱{quickViewProduct.price.toLocaleString()}
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" /> Free express delivery on orders
                      over ₱5,000
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Button
                      onClick={() => {
                        onAddToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="w-full rounded-full py-3 text-xs font-semibold"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Bag · ₱
                      {quickViewProduct.price.toLocaleString()}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------- Lifestyle --------------------------------- */

const lifestyles = [
  { title: "The Developer Workspace", tag: "Focus · Dark Mode", img: lifestyleDeveloper, items: 8 },
  {
    title: "The Creator Studio",
    tag: "Cameras · Color Accuracy",
    img: lifestyleDesigner,
    items: 11,
  },
  { title: "The Minimal Home Office", tag: "Calm · Compact", img: lifestyleHome, items: 6 },
];

function Lifestyle() {
  return (
    <section id="workspaces" className="bg-surface hairline-t hairline-b">
      <div className="container-editorial py-20 lg:py-28">
        <Reveal>
          <div className="mx-auto mb-14 max-w-4xl text-center">
            <div className="eyebrow mb-3">Workspace Environments</div>
            <h2 className="headline text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Complete setups, not isolated products.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Explore fully-composed workspaces staged by our editors — every piece seamlessly
              shoppable.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lifestyles.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <a href="#products" className="group relative block overflow-hidden rounded-3xl">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
                    {s.tag}
                  </div>
                  <h3 className="mt-2 text-2xl font-medium">{s.title}</h3>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="opacity-85">{s.items} products featured</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white group-hover:text-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Why Northlane ------------------------------ */

const values = [
  {
    n: "01",
    t: "Curated Selection",
    d: "Every product is rigorously tested for material durability, tactile feedback, and timeless aesthetic coherence.",
    icon: CheckCircle2,
  },
  {
    n: "02",
    t: "Crafted Engineering",
    d: "Products designed to elevate both day-to-day productivity and the quiet visual atmosphere of your room.",
    icon: Layers,
  },
  {
    n: "03",
    t: "Studio Concierge",
    d: "Tailored recommendation guides, setup pairing specs, and personalized assistance whenever you need it.",
    icon: Compass,
  },
  {
    n: "04",
    t: "Seamless Delivery",
    d: "Fast global shipping, 30-day trial guarantee, responsive support, and effortless return policies.",
    icon: Truck,
  },
];

function WhyNorthlane() {
  return (
    <section className="container-editorial py-20 lg:py-28">
      <Reveal>
        <div className="mb-14 max-w-3xl">
          <div className="eyebrow mb-3">The Northlane Difference</div>
          <h2 className="headline text-4xl lg:text-5xl">
            Details you'll notice, quietly, every single day.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => {
          const IconComp = v.icon;
          return (
            <Reveal key={v.n} delay={i * 0.06}>
              <div className="group relative flex h-full flex-col justify-between rounded-[2.2rem] border border-hairline bg-surface p-7 transition-all duration-300 hover:border-foreground/30 hover:shadow-xl hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-tight text-accent">{v.n}</span>
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-hairline bg-background text-muted-foreground transition group-hover:border-foreground group-hover:text-foreground">
                      <IconComp className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">{v.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-normal">
                    {v.d}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------- Studio Concierge ---------------------------- */

function StudioConcierge({ onAddToCart }: { onAddToCart: (p: ProductItem) => void }) {
  const [activeTab, setActiveTab] = useState(0);

  const editions = [
    {
      id: "dev",
      label: "01. Developer Setup",
      subtitle:
        "Engineered for quiet typing, long coding sessions, and multi-device workstation flow.",
      items: [products[0], products[1], products[2]],
    },
    {
      id: "design",
      label: "02. Design & Editing",
      subtitle: "Color-accurate warm LED illumination, precision tracking, and tactile desk tools.",
      items: [products[3], products[1], products[0]],
    },
    {
      id: "focus",
      label: "03. Acoustic Focus",
      subtitle: "Adaptive noise isolation, ergonomic comfort, and warm lighting for deep work.",
      items: [products[2], products[3], products[1]],
    },
  ];

  const current = editions[activeTab];

  return (
    <section id="concierge" className="bg-surface/50 hairline-t hairline-b">
      <div className="container-editorial py-20 lg:py-28">
        <Reveal>
          <div className="mx-auto mb-12 max-w-5xl text-center">
            <div className="eyebrow mb-3 flex items-center justify-center gap-2">
              <Compass className="h-3.5 w-3.5 text-accent" />
              <span>Studio Pairing Guidance</span>
            </div>
            <h2 className="headline text-2xl sm:text-4xl lg:text-5xl whitespace-nowrap">
              Curated setup pairings, tailored by workflow.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
              Explore hand-selected studio essentials staged for specific workflows and desk
              environments.
            </p>
          </div>
        </Reveal>

        {/* Studio Edition Switcher Tabs */}
        <Reveal delay={0.05}>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {editions.map((e, idx) => (
              <button
                key={e.id}
                onClick={() => setActiveTab(idx)}
                className={`rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 border ${
                  activeTab === idx
                    ? "bg-foreground text-background border-foreground shadow-md scale-105"
                    : "border-hairline bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Edition Subtitle */}
        <Reveal delay={0.1}>
          <div className="mx-auto mb-10 max-w-xl text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {current.subtitle}
          </div>
        </Reveal>

        {/* 3 Matched Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {current.items.map((p, i) => (
            <Reveal key={`${current.id}-${p.id}`} delay={0.1 + i * 0.05}>
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.2rem] border border-hairline bg-background p-6 transition-all duration-500 hover:border-foreground/30 hover:shadow-xl">
                <div>
                  {/* Product Image Frame */}
                  <div className="relative overflow-hidden rounded-2xl bg-surface aspect-[4/3] mb-5">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-foreground backdrop-blur border border-hairline">
                      ★ {p.rating} · Match
                    </div>
                  </div>

                  {/* Product Metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground font-normal">{p.subtitle}</p>
                    </div>
                    <div className="text-base font-bold text-foreground">
                      ₱{p.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Add to Bag Action */}
                <div className="mt-6 border-t border-hairline pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    {p.category}
                  </span>
                  <button
                    onClick={() => onAddToCart(p)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-foreground/90 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add to Bag
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Workspace Builder ---------------------------- */

const profiles = ["Developers", "Designers", "Students", "Creators", "Remote Workers"];

function Builder({ onAddToCart }: { onAddToCart: (p: ProductItem) => void }) {
  const [active, setActive] = useState(0);
  const setups = [
    {
      total: 32400,
      items: [
        "Focus Desk Walnut",
        "Aster 65 Keyboard",
        "Nordic Mouse",
        "Halo ANC Headphones",
        "Meridian Lamp",
        "Ergonomic Chair",
      ],
      img: lifestyleDeveloper,
    },
    {
      total: 41800,
      items: [
        '27" 5K Studio Display',
        "Wacom Pro Tablet",
        "Meridian Lamp",
        "Standing Desk Walnut",
        "Task Lighting",
        "Color Calibrator",
      ],
      img: lifestyleDesigner,
    },
    {
      total: 14900,
      items: [
        "Compact Desk",
        "Nordic Wireless Mouse",
        "Meridian Lamp",
        "Reading Stand",
        "Notebook Set",
      ],
      img: lifestyleHome,
    },
    {
      total: 56200,
      items: [
        "4K Camera System",
        "Studio Microphone",
        "Key Light",
        "Boom Arm",
        "Halo ANC Headphones",
        "Editing Deck",
      ],
      img: lifestyleDesigner,
    },
    {
      total: 23800,
      items: [
        "Laptop Stand",
        "Aster 65 Keyboard",
        "Nordic Mouse",
        "Halo Headphones",
        "Focus Desk Walnut",
      ],
      img: lifestyleHome,
    },
  ];
  const cur = setups[active];

  return (
    <section className="bg-surface hairline-t hairline-b">
      <div className="container-editorial py-20 lg:py-28">
        <Reveal>
          <div className="mb-8 max-w-4xl">
            <div className="eyebrow mb-3">Interactive Workspace Builder</div>
            <h2 className="headline text-4xl lg:text-5xl">Choose a profile. See the setup.</h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="mb-10 flex flex-wrap gap-2">
            {profiles.map((p, i) => (
              <button
                key={p}
                onClick={() => setActive(i)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  active === i
                    ? "border-foreground bg-foreground text-background"
                    : "border-hairline bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-hairline shadow-md">
              <img
                src={cur.img}
                alt="Selected workspace"
                className="aspect-[5/4] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex h-full flex-col rounded-3xl border border-hairline bg-background p-8 shadow-sm">
              <div className="eyebrow mb-2">{profiles[active]} Setup</div>
              <div className="text-2xl font-bold">Estimated Investment</div>
              <div className="mt-2 text-5xl font-semibold tracking-tight text-foreground">
                ₱{cur.total.toLocaleString()}
              </div>

              <div className="my-6 h-px w-full bg-hairline" />

              <div className="space-y-3.5">
                {cur.items.map((it) => (
                  <div key={it} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline text-muted-foreground">
                        <Check className="h-3 w-3 text-accent" />
                      </span>
                      <span className="font-medium text-foreground">{it}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Included</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <Button
                  onClick={() => {
                    onAddToCart(products[0]);
                    toast.success(`Selected ${profiles[active]} setup added to cart!`);
                  }}
                  className="w-full"
                >
                  Shop Entire Setup <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Customer Stories --------------------------------- */

const storiesList = [
  {
    customer_name: "Elena Marín",
    customer_role: "Product Designer · Madrid",
    quote: "The desk finally feels like a studio.",
    body: "Elena rebuilt her home workspace around three Northlane pieces — the Focus Desk Walnut, Meridian lamp, and Halo headphones. What used to feel like a temporary corner now feels like a sanctuary.",
    image_url: storyPortrait,
  },
  {
    customer_name: "Marcus Vance",
    customer_role: "Staff Software Engineer · Copenhagen",
    quote: "Quiet tactile precision for long coding sessions.",
    body: "After switching to the Aster 65 keyboard and Nordic wireless mouse, my wrists feel rested and my desk looks completely uncluttered.",
    image_url: lifestyleDeveloper,
  },
];

function Stories() {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const fetchStories = useServerFn(listCustomerStories);
  const { data } = useQuery({
    queryKey: ["customer-stories"],
    queryFn: () => fetchStories({}),
  });

  const allStories = data && data.length > 0 ? data : storiesList;
  const story = allStories[activeStoryIdx % allStories.length];
  const portrait = story.image_url || storyPortrait;

  return (
    <section id="stories" className="container-editorial py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-hairline bg-surface shadow-lg">
            <img
              src={portrait}
              alt={story.customer_name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <div className="eyebrow mb-4">Customer Stories</div>
            <h2 className="headline text-4xl lg:text-5xl leading-tight font-serif italic">
              "{story.quote}"
            </h2>
            {story.body && (
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                {story.body}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-hairline pt-6">
              <div>
                <div className="text-base font-bold text-foreground">{story.customer_name}</div>
                {story.customer_role && (
                  <div className="text-xs text-muted-foreground">{story.customer_role}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <IconBtn
                  label="Previous story"
                  onClick={() =>
                    setActiveStoryIdx((prev) => (prev > 0 ? prev - 1 : allStories.length - 1))
                  }
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </IconBtn>
                <IconBtn
                  label="Next story"
                  onClick={() => setActiveStoryIdx((prev) => (prev + 1) % allStories.length)}
                >
                  <ArrowRight className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[productLamp, productKeyboard, productHeadphones].map((img, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-2xl bg-muted border border-hairline"
                >
                  <img
                    src={img}
                    alt="Featured in setup"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- Journal --------------------------------- */

const defaultJournal = [
  {
    id: "d1",
    tag: "Guide",
    title: "Building a Better Workspace",
    read_time: "6 min",
    image_url: lifestyleHome,
  },
  {
    id: "d2",
    tag: "Essay",
    title: "Choosing the Right Mechanical Keyboard",
    read_time: "8 min",
    image_url: productKeyboard,
  },
  {
    id: "d3",
    tag: "Setup",
    title: "A Minimal Desk Setup Guide",
    read_time: "4 min",
    image_url: collectionFurniture,
  },
];

function Journal() {
  const fetchPosts = useServerFn(listJournalPosts);
  const { data } = useQuery({
    queryKey: ["journal-posts"],
    queryFn: () => fetchPosts({}),
  });
  const posts = data && data.length > 0 ? data : defaultJournal;

  return (
    <section id="journal" className="hairline-t bg-surface hairline-b">
      <div className="container-editorial py-20 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Journal</div>
              <h2 className="headline text-4xl lg:text-5xl">Words on work, gear, and space.</h2>
            </div>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              All articles →
            </a>
          </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((a, i) => (
            <Reveal key={a.id ?? a.title} delay={i * 0.06}>
              <a href="#" className="group block">
                <div className="mb-4 overflow-hidden rounded-2xl border border-hairline">
                  <img
                    src={a.image_url || lifestyleHome}
                    alt={a.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="eyebrow mb-2">
                  {a.tag} · {a.read_time}
                </div>
                <h3 className="text-xl font-medium leading-snug transition-colors group-hover:text-accent">
                  {a.title}
                </h3>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA --------------------------------- */

function FinalCTA() {
  return (
    <section className="container-editorial py-20 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-hairline bg-gradient-to-b from-surface via-background to-surface/80 p-10 sm:p-16 lg:p-24 text-center shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.68_0.19_258_/_0.06),transparent_70%)]" />

          {/* Top Eyebrow */}
          <div className="eyebrow mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Copenhagen Studio Edition
          </div>

          {/* Luxury Editorial Headline */}
          <h2 className="headline mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Create a workspace <br className="hidden sm:block" />
            you'll love coming back to.
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            Explore carefully engineered workspace essentials designed to elevate clarity,
            ergonomics, and daily focus.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/shop">
              <Button className="px-7 py-6 text-sm shadow-lg hover:shadow-xl font-medium rounded-full">
                Explore Shop Catalog <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="#concierge">
              <Button
                variant="secondary"
                className="px-7 py-6 text-sm font-medium rounded-full border-hairline"
              >
                <Compass className="h-4 w-4 text-accent mr-1" />
                Studio Concierge
              </Button>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// Shared Footer component imported from "@/components/layout/Footer"

/* ------------------------------ Page Assembly ------------------------------ */

function Landing() {
  const { user } = useAuthUser();
  const { addToCart } = useCart();
  const [signUpNoticeOpen, setSignUpNoticeOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  function handleAddToCart(product: any) {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.img || product.image || "",
      category: product.category,
      stockCount: product.stockCount,
      quantity: 1,
    });
  }

  function handleToggleWishlist(product: ProductItem) {
    if (!user) {
      setSignUpNoticeOpen(true);
      return;
    }
    if (wishlistIds.includes(product.id)) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      toast.info(`Removed ${product.name} from wishlist`);
    } else {
      setWishlistIds((prev) => [...prev, product.id]);
      toast.success(`Saved ${product.name} to wishlist!`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20">
      <Nav
        cartCount={0}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartOpen(true)}
        onShowSignUpNotice={() => setSignUpNoticeOpen(true)}
      />

      <main>
        <Hero onAddToCart={handleAddToCart} />
        <Trusted />
        <Collections />
        <AISetupStager />
        <Featured
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
        />
        <Lifestyle />
        <WhyNorthlane />
        <StudioConcierge onAddToCart={handleAddToCart} />
        <Builder onAddToCart={handleAddToCart} />
        <Stories />
        <Journal />
        <FinalCTA />
      </main>

      <Footer />
      <SignUpNoticeModal isOpen={signUpNoticeOpen} onClose={() => setSignUpNoticeOpen(false)} />
      <AIShoppingAssistant onAddToCart={handleAddToCart} onShowSignUpNotice={() => setSignUpNoticeOpen(true)} user={user} />

    </div>
  );
}
