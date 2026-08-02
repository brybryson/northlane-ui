import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Bot,
  LogOut,
  CheckCircle2,
  Download,
  Shield,
  Plus,
  Trash2,
  Search,
  Copy,
  Check,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "@/components/CartDrawer";

// Assets for demo order items
import productKeyboard from "@/assets/product-keyboard.jpg";
import productMouse from "@/assets/product-mouse.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLamp from "@/assets/product-lamp.jpg";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account & Orders — Northlane Studio" },
      { name: "description", content: "Manage your Northlane orders, package tracking, saved shipping addresses, and AI assistant history." },
    ],
  }),
  component: AccountPage,
});

/* -------------------------------- Types -------------------------------- */

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  sku: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: "Processing" | "Shipped" | "In Transit" | "Delivered";
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: OrderItem[];
  shippingAddress: string;
  timelineStep: number; // 1: Order Placed, 2: Processing, 3: In Transit, 4: Delivered
}

interface Address {
  id: string;
  type: "Shipping" | "Billing";
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex" | "ApplePay";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface AIConversationLog {
  id: string;
  date: string;
  topic: string;
  userPrompt: string;
  aiSummary: string;
  recommendedProducts: string[];
}

/* ------------------------------ Mock Data ------------------------------ */

const INITIAL_ORDERS: Order[] = [
  {
    id: "NL-89210",
    date: "2026-08-01",
    total: 485,
    status: "In Transit",
    carrier: "DHL Express",
    trackingNumber: "DHL-9842109482",
    estimatedDelivery: "Aug 04, 2026",
    shippingAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
    timelineStep: 3,
    items: [
      {
        id: "prod-kb-85",
        name: "Ergonomic Low-Profile Mechanical Keyboard",
        price: 210,
        qty: 1,
        image: productKeyboard,
        sku: "NL-KB-85",
      },
      {
        id: "prod-mat-oak",
        name: "Northlane Solid Oak Wool Desk Mat",
        price: 85,
        qty: 1,
        image: productMouse,
        sku: "NL-MAT-OAK",
      },
      {
        id: "prod-lamp-brass",
        name: "Minimalist Brass Desk Task Lamp",
        price: 140,
        qty: 1,
        image: productLamp,
        sku: "NL-LMP-BR",
      },
    ],
  },
  {
    id: "NL-87402",
    date: "2026-07-15",
    total: 320,
    status: "Delivered",
    carrier: "FedEx Priority",
    trackingNumber: "FDX-7719204821",
    estimatedDelivery: "Jul 18, 2026",
    shippingAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
    timelineStep: 4,
    items: [
      {
        id: "prod-aud-pro",
        name: "Acoustic Noise-Isolating Headphones",
        price: 320,
        qty: 1,
        image: productHeadphones,
        sku: "NL-AUD-PRO",
      },
    ],
  },
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    type: "Shipping",
    label: "Design Studio",
    name: "Alex Vance",
    street: "124 Copenhagen Way, Studio #4B",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    country: "United States",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Billing",
    label: "Headquarters",
    name: "Alex Vance",
    street: "500 Howard Street, Suite 1200",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "United States",
    isDefault: false,
  },
];

const INITIAL_PAYMENTS: PaymentMethod[] = [
  {
    id: "pm-1",
    brand: "Visa",
    last4: "4242",
    expMonth: 11,
    expYear: 2028,
    isDefault: true,
  },
  {
    id: "pm-2",
    brand: "Mastercard",
    last4: "8899",
    expMonth: 8,
    expYear: 2027,
    isDefault: false,
  },
];

const INITIAL_AI_LOGS: AIConversationLog[] = [
  {
    id: "log-1",
    date: "2026-08-02 14:20",
    topic: "Minimalist Coding Setup",
    userPrompt: "Recommend silent mechanical keyboards under $250 with warm backlighting for night coding",
    aiSummary:
      "Matched Monolith Low-Profile Mechanical Keyboard with linear silent switches and CNC aluminum body.",
    recommendedProducts: ["Monolith Low-Profile Keyboard", "Northlane Solid Oak Wool Desk Mat"],
  },
  {
    id: "log-2",
    date: "2026-07-28 09:15",
    topic: "Studio Audio & Headphone Specs",
    userPrompt: "Compare planar magnetic headphones vs closed-back acoustic monitors",
    aiSummary: "Analyzed spatial audio resolution, bass response curve, and acoustic isolation properties.",
    recommendedProducts: ["Acoustic Noise-Isolating Headphones"],
  },
];

/* ---------------------------- Component Core --------------------------- */

function AccountPage() {
  const navigate = useNavigate();
  const { itemCount, setIsOpen } = useCart();
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses" | "payments" | "ai-history">("orders");
  const [authUser, setAuthUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [payments, setPayments] = useState<PaymentMethod[]>(INITIAL_PAYMENTS);
  const [aiLogs, setAiLogs] = useState<AIConversationLog[]>(INITIAL_AI_LOGS);

  // Profile Form state
  const [fullName, setFullName] = useState("Alex Vance");
  const [phone, setPhone] = useState("+1 (415) 890-2104");
  const [currency, setCurrency] = useState("USD ($)");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");

  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Account profile updated successfully!");
    }, 400);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) {
      toast.error("Please fill in street and city.");
      return;
    }
    const newEntry: Address = {
      id: `addr-${Date.now()}`,
      type: "Shipping",
      label: newAddrLabel || "New Location",
      name: fullName,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState || "CA",
      zip: newAddrZip || "94101",
      country: "United States",
      isDefault: false,
    };
    setAddresses((prev) => [...prev, newEntry]);
    setShowAddressModal(false);
    setNewAddrLabel("");
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrState("");
    setNewAddrZip("");
    toast.success("New shipping address added!");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.info("Address removed.");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    toast.success("Default shipping address updated.");
  };

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    toast.success("Tracking number copied to clipboard!");
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Navigation Header matching Shop & Landing */}
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

            <div className="flex items-center justify-end gap-2">
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
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-foreground bg-foreground text-background transition cursor-pointer"
                aria-label="Account"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* User Hero Banner */}
        <section className="border-b border-hairline bg-surface py-6 sm:py-10 lg:py-12">
          <div className="container-editorial">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
              {/* User Info Avatar & Details */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-foreground text-background font-bold text-2xl flex items-center justify-center shadow-xs border border-hairline shrink-0">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Customer Portal
                  </div>
                  <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {fullName}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <span>{authUser?.email || "alex.vance@northlane.studio"}</span>
                    <span>•</span>
                    <span>Member since 2026</span>
                  </p>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="flex items-center gap-3">
                <Link
                  to="/shop"
                  className="px-4 py-2 rounded-full bg-background hover:bg-surface text-foreground text-xs font-semibold border border-hairline transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5 text-accent" />
                  <span>Explore Shop</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full bg-surface hover:bg-red-500/10 text-muted-foreground hover:text-red-600 text-xs font-semibold border border-hairline transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto mt-8 pt-4 scrollbar-none border-t border-hairline">
              {[
                { id: "orders", label: "Orders & Tracking", icon: Package, count: orders.length },
                { id: "profile", label: "Profile & Settings", icon: User },
                { id: "addresses", label: "Saved Addresses", icon: MapPin, count: addresses.length },
                { id: "payments", label: "Payment Methods", icon: CreditCard, count: payments.length },
                { id: "ai-history", label: "AI Conversation Log", icon: Bot, count: aiLogs.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? "bg-foreground text-background border-foreground shadow-xs"
                        : "bg-background text-muted-foreground hover:text-foreground border-hairline hover:border-foreground/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? "bg-background/20 text-background"
                            : "bg-surface text-accent border border-accent/20"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Tab Content Body */}
        <main className="container-editorial py-8 sm:py-12">
          <AnimatePresence mode="wait">
            {/* TAB 1: ORDERS & TRACKING */}
            {activeTab === "orders" && (
              <motion.div
                key="tab-orders"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Order History
                    </div>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Package Tracking & History
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Track shipments in real-time, view detailed receipts, or reorder studio essentials.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground bg-surface px-3.5 py-1.5 rounded-full border border-hairline">
                    {orders.length} Active Orders
                  </div>
                </div>

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl bg-background border border-hairline overflow-hidden shadow-xs space-y-0"
                  >
                    {/* Order Top Bar */}
                    <div className="p-5 sm:p-6 bg-surface/50 border-b border-hairline flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Order ID</span>
                          <span className="text-sm font-bold tracking-tight text-foreground">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Order Date</span>
                          <span className="text-xs text-foreground font-semibold">{order.date}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Total Paid</span>
                          <span className="text-xs font-bold text-foreground">${order.total}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                            order.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : "bg-accent/10 text-accent border-accent/20"
                          }`}
                        >
                          {order.status === "Delivered" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Truck className="w-3.5 h-3.5" />
                          )}
                          <span>{order.status}</span>
                        </span>

                        <button
                          onClick={() => toast.success(`Invoice PDF generated for order ${order.id}`)}
                          className="p-2 rounded-full bg-background hover:bg-surface text-foreground transition-colors border border-hairline cursor-pointer"
                          title="Download Receipt PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Package Tracking Timeline */}
                    <div className="p-5 sm:p-6 bg-background border-b border-hairline">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold text-foreground">
                            {order.carrier} — <span className="text-accent font-bold">{order.trackingNumber}</span>
                          </span>
                          <button
                            onClick={() => handleCopyTracking(order.trackingNumber)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Copy tracking number"
                          >
                            {copiedTracking === order.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Estimated Delivery: <strong className="text-foreground font-semibold">{order.estimatedDelivery}</strong>
                        </span>
                      </div>

                      {/* Progress Bar Timeline */}
                      <div className="relative mt-6 mb-2">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-surface border border-hairline">
                          <div
                            style={{
                              width: `${
                                order.timelineStep === 1
                                  ? "25%"
                                  : order.timelineStep === 2
                                  ? "50%"
                                  : order.timelineStep === 3
                                  ? "75%"
                                  : "100%"
                              }`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-foreground transition-all duration-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 text-center mt-3">
                          {[
                            { step: 1, label: "Order Placed" },
                            { step: 2, label: "Processing" },
                            { step: 3, label: "In Transit" },
                            { step: 4, label: "Delivered" },
                          ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center">
                              <span
                                className={`text-[10px] font-semibold ${
                                  order.timelineStep >= s.step ? "text-foreground font-bold" : "text-muted-foreground"
                                }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-5 sm:p-6">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-4">Included Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-surface/50 border border-hairline"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-hairline shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold tracking-tight text-foreground truncate">{item.name}</h5>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                  SKU: {item.sku} • Qty: {item.qty}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-foreground">
                                ${item.price * item.qty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB 2: PROFILE & SECURITY */}
            {activeTab === "profile" && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-3xl space-y-8"
              >
                <div>
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Account Credentials
                  </div>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Profile & Security Settings
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Manage your studio account credentials, security preferences, and global settings.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-xs space-y-6">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1 font-semibold">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1 font-semibold">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={authUser?.email || "alex.vance@northlane.studio"}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-hairline text-muted-foreground text-xs cursor-not-allowed font-semibold"
                    />
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Contact studio support to request an email address change.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1 font-semibold">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer font-semibold"
                    >
                      <option value="USD ($)">USD ($) — US Dollar</option>
                      <option value="EUR (€)">EUR (€) — Euro</option>
                      <option value="GBP (£)">GBP (£) — British Pound</option>
                      <option value="CAD ($)">CAD ($) — Canadian Dollar</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-hairline flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingProfile ? "Saving..." : "Save Profile Changes"}
                    </button>
                  </div>
                </form>

                {/* Password & Security Section */}
                <div className="p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    Security & Authentication
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your account is protected by Supabase SSL authentication and encrypted sessions.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => toast.info("Password reset link sent to your registered email address.")}
                      className="px-5 py-2.5 rounded-full bg-surface hover:bg-muted/60 text-foreground text-xs font-semibold border border-hairline transition-colors cursor-pointer"
                    >
                      Send Password Reset Link
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <motion.div
                key="tab-addresses"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Fulfillment Destinations
                    </div>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Saved Shipping Addresses
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Manage delivery destinations for fast 1-click checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-5 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-6 rounded-2xl bg-background border transition-all relative ${
                        addr.isDefault
                          ? "border-foreground shadow-xs"
                          : "border-hairline hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span className="text-sm font-bold text-foreground">{addr.label}</span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-bold text-foreground">{addr.name}</p>
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p className="text-muted-foreground">{addr.country}</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs text-accent hover:underline font-semibold cursor-pointer"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold">Primary Location</span>
                        )}

                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Address Modal Dialog */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-background border border-hairline shadow-2xl space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-hairline pb-3">
                        <h3 className="text-base font-bold text-foreground">Add New Address</h3>
                        <button
                          onClick={() => setShowAddressModal(false)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1 font-semibold">Location Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Home, Studio, Office"
                            value={newAddrLabel}
                            onChange={(e) => setNewAddrLabel(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1 font-semibold">Street Address</label>
                          <input
                            type="text"
                            placeholder="123 Market St, Suite 400"
                            value={newAddrStreet}
                            onChange={(e) => setNewAddrStreet(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1 font-semibold">City</label>
                            <input
                              type="text"
                              placeholder="San Francisco"
                              value={newAddrCity}
                              onChange={(e) => setNewAddrCity(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1 font-semibold">State & Zip</label>
                            <input
                              type="text"
                              placeholder="CA 94105"
                              value={newAddrState}
                              onChange={(e) => setNewAddrState(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-background border border-hairline text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="px-4 py-2 rounded-full border border-hairline text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: PAYMENT METHODS */}
            {activeTab === "payments" && (
              <motion.div
                key="tab-payments"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Saved Wallet
                    </div>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Payment Methods
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Manage payment cards linked to your Stripe wallet.
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info("Stripe card management modal opened.")}
                    className="px-5 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {payments.map((pm) => (
                    <div
                      key={pm.id}
                      className={`p-6 rounded-2xl bg-background border transition-all ${
                        pm.isDefault
                          ? "border-foreground shadow-xs"
                          : "border-hairline hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-5 h-5 text-accent" />
                          <span className="text-sm font-bold text-foreground">{pm.brand}</span>
                        </div>
                        {pm.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            Default Payment
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-foreground tracking-widest my-2">
                        •••• •••• •••• {pm.last4}
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-hairline">
                        <span>Expires {pm.expMonth}/{pm.expYear}</span>
                        <button
                          onClick={() => toast.info("Payment method updated")}
                          className="text-accent hover:underline font-semibold cursor-pointer"
                        >
                          Edit Card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: AI CONVERSATION HISTORY */}
            {activeTab === "ai-history" && (
              <motion.div
                key="tab-ai-history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Intelligence Log
                    </div>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      AI Shopping Assistant Log
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Review your past AI concierge inquiries, search logs, and saved recommendations.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground bg-surface px-3.5 py-1.5 rounded-full border border-hairline">
                    {aiLogs.length} Saved Inquiries
                  </div>
                </div>

                <div className="space-y-4">
                  {aiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-6 rounded-2xl bg-background border border-hairline shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-accent" />
                          <span className="text-sm font-bold text-foreground">{log.topic}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">{log.date}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Your Inquiry</span>
                        <p className="text-xs text-foreground font-semibold mt-0.5">"{log.userPrompt}"</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface/50 border border-hairline space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent block">AI Summary & Recommendation</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{log.aiSummary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Global Footer & Cart Drawer */}
      <Footer />
      <CartDrawer />
    </div>
  );
}
