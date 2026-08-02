import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({
    meta: [
      { title: "Account Dashboard — Northlane Studio" },
      { name: "description", content: "Overview hub for your studio orders, saved addresses, wallet, and settings." },
    ],
  }),
  component: AccountDashboardPage,
});

function AccountDashboardPage() {
  const cards = [
    {
      title: "Package Tracking & Orders",
      description: "Inspect active shipments, delivery timelines, and past studio order receipts.",
      href: "/account/orders",
      icon: Package,
      badge: "1 Active Order",
    },
    {
      title: "Profile & Security Settings",
      description: "Manage personal credentials, phone number, currency preferences, and password reset.",
      href: "/account/profile",
      icon: User,
      badge: "256-bit SSL",
    },
    {
      title: "Saved Shipping Addresses",
      description: "Manage default shipping and billing destinations for 1-click checkout.",
      href: "/account/profile",
      icon: MapPin,
      badge: "2 Saved Locations",
    },
    {
      title: "Saved Payment Wallet",
      description: "Manage payment cards linked to your Stripe wallet.",
      href: "/account/payment-methods",
      icon: CreditCard,
      badge: "Stripe Secured",
    },
    {
      title: "AI Concierge Log",
      description: "Review past AI shopping recommendations, specs inquiries, and setup advice.",
      href: "/account/ai-conversations",
      icon: Bot,
      badge: "AI History",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Account Overview Hub
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome to Your Studio Hub
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Select an independent feature module below to manage your orders, settings, wallet, or AI logs.
        </p>
      </div>

      {/* Grid of Independent Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.href}
              to={card.href}
              className="p-6 rounded-2xl bg-background border border-hairline hover:border-foreground/40 transition-all shadow-xs group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-surface border border-hairline flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                  <IconComponent className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between text-xs font-bold text-foreground">
                <span>Manage Module</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Order Status Banner */}
      <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-background border border-hairline flex items-center justify-center text-accent shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">Active Order: NL-89210</span>
            <span className="text-xs text-muted-foreground">Status: In Transit — Est. Delivery Aug 04, 2026</span>
          </div>
        </div>
        <Link
          to="/account/orders"
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold transition-all shadow-xs shrink-0"
        >
          Track Shipment
        </Link>
      </div>
    </div>
  );
}
