import { createFileRoute, useNavigate, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Bot,
  LogOut,
  Search,
  ShoppingBag,
  Heart,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "@/components/CartDrawer";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account Hub — Northlane Studio" },
      { name: "description", content: "Manage your Northlane orders, profile credentials, payment methods, saved addresses, and AI logs." },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, setIsOpen } = useCart();
  const [authUser, setAuthUser] = useState<any>(null);
  const [fullName, setFullName] = useState("Vrsnmllz03");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser(data.user);
        if (data.user.email) {
          const emailName = data.user.email.split("@")[0];
          setFullName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out safely");
    navigate({ to: "/auth" });
  };

  const navTabs = [
    { href: "/account", label: "Dashboard", icon: LayoutDashboard },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/profile", label: "Profile & Settings", icon: User },
    { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
    { href: "/account/payment-methods", label: "Payment Methods", icon: CreditCard },
    { href: "/account/ai-conversations", label: "AI Conversation Log", icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-background/90 backdrop-blur-xl transition-all duration-300">
          <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
            <Link
              to="/"
              className="group flex items-center gap-2 text-[15px] font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
              <span className="font-bold tracking-tight">Northlane</span>
            </Link>

            <nav className="hidden justify-center gap-8 lg:flex">
              <Link to="/shop" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <a
                href="/#collections"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Collections
              </a>
              <a
                href="/#concierge"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Concierge
              </a>
              <a
                href="/#workspaces"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Workspaces
              </a>
              <a
                href="/#journal"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Journal
              </a>
            </nav>

            <div className="flex items-center justify-end gap-2.5">
              <Link
                to="/shop"
                className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-background hover:bg-surface text-foreground text-xs font-semibold border border-hairline transition-colors items-center gap-1.5 shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-accent" />
                <span>Explore Shop</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-surface hover:bg-red-500/10 text-muted-foreground hover:text-red-600 text-xs font-semibold border border-hairline transition-colors items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <div className="h-4 w-px bg-hairline hidden sm:block mx-1" />

              <Link
                to="/wishlist"
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-hairline bg-background text-foreground transition hover:bg-surface cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-hairline bg-background text-foreground transition hover:bg-surface cursor-pointer"
                aria-label="Cart Bag"
              >
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {itemCount}
                  </span>
                )}
              </button>

              <Link
                to="/account"
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-foreground bg-foreground text-background transition cursor-pointer overflow-hidden"
                aria-label="Account"
              >
                {authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture ? (
                  <img
                    src={authUser.user_metadata.avatar_url || authUser.user_metadata.picture}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* User Hero Header Banner */}
        <section className="bg-surface border-b border-hairline py-6 sm:py-10">
          <div className="container-editorial">
            <div className="flex items-center gap-4">
              {authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture ? (
                <img
                  src={authUser.user_metadata.avatar_url || authUser.user_metadata.picture}
                  alt="User Profile"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-xs border border-hairline shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-foreground text-background font-bold text-2xl flex items-center justify-center shadow-xs border border-hairline shrink-0">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  Customer Portal
                </div>
                <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {fullName}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <span>{authUser?.email || "vrsnmllz03@gmail.com"}</span>
                  <span>•</span>
                  <span>Member since 2026</span>
                </p>
              </div>
            </div>

            {/* Modular Sub-Route Navigation Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-8 pt-4 border-t border-hairline">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  tab.href === "/account"
                    ? location.pathname === "/account" || location.pathname === "/account/"
                    : location.pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    to={tab.href}
                    className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] transition-all flex items-center gap-2 cursor-pointer border ${
                      isActive
                        ? "bg-foreground text-background border-foreground shadow-xs"
                        : "border-hairline bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Modular Sub-Route Content Outlet */}
        <main className="container-editorial py-8 sm:py-12">
          <Outlet />
        </main>
      </div>

      {/* Global Footer & Cart Drawer */}
      <Footer />
      <CartDrawer />
    </div>
  );
}
