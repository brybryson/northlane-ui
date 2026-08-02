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
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Search,
  ArrowRight,
  RotateCcw,
  Download,
  AlertCircle,
  Copy,
  Check,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    total: 480,
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
          // Default name from email prefix if not set
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
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500/20 pt-20 pb-24">
      {/* Top Header Banner */}
      <div className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Info Avatar & Details */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold text-2xl flex items-center justify-center shadow-xl shadow-amber-500/20 border border-amber-400/40">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-medium text-white">{fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-medium">
                    Studio Member
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 font-light flex items-center gap-2">
                  <span>{authUser?.email || "alex.vance@northlane.studio"}</span>
                  <span>•</span>
                  <span className="text-stone-500">Member since 2026</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-medium border border-stone-800 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore Catalog</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 text-xs font-medium border border-red-900/50 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto mt-8 pt-2 scrollbar-none border-t border-stone-800/80">
            {[
              { id: "orders", label: "Order History & Live Tracking", icon: Package, count: orders.length },
              { id: "profile", label: "Profile & Security", icon: User },
              { id: "addresses", label: "Saved Addresses", icon: MapPin, count: addresses.length },
              { id: "payments", label: "Payment Methods", icon: CreditCard, count: payments.length },
              { id: "ai-history", label: "AI Conversation History", icon: Bot, count: aiLogs.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/50 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? "bg-amber-500 text-stone-950 font-bold"
                          : "bg-stone-800 text-stone-400"
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
      </div>

      {/* Main Tab Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                  <h2 className="text-xl font-serif text-white font-medium">Your Orders & Live Tracking</h2>
                  <p className="text-xs text-stone-400 mt-1 font-light">
                    Track shipments in real-time, view detailed receipts, or quickly reorder studio items.
                  </p>
                </div>
                <div className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                  {orders.length} Active Orders Found
                </div>
              </div>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-stone-900/70 border border-stone-800 overflow-hidden shadow-xl"
                >
                  {/* Order Top Bar */}
                  <div className="p-6 bg-stone-900 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-500 block">Order Number</span>
                        <span className="text-sm font-bold font-mono text-white">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-500 block">Order Date</span>
                        <span className="text-xs text-stone-300 font-medium">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Amount</span>
                        <span className="text-xs font-bold font-mono text-amber-400">${order.total}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
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
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Package Tracking Timeline */}
                  <div className="p-6 bg-stone-950/40 border-b border-stone-800/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-stone-200">
                          {order.carrier} — <span className="font-mono text-amber-400">{order.trackingNumber}</span>
                        </span>
                        <button
                          onClick={() => handleCopyTracking(order.trackingNumber)}
                          className="text-stone-500 hover:text-stone-300 transition-colors"
                          title="Copy tracking number"
                        >
                          {copiedTracking === order.trackingNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-stone-400 font-light">
                        Estimated Delivery: <strong className="text-white font-medium">{order.estimatedDelivery}</strong>
                      </span>
                    </div>

                    {/* Progress Bar Timeline */}
                    <div className="relative mt-6 mb-2">
                      <div className="overflow-hidden h-2 text-xs flex rounded-full bg-stone-800">
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
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
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
                              className={`text-[10px] font-medium ${
                                order.timelineStep >= s.step ? "text-amber-400 font-semibold" : "text-stone-600"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="p-6">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-4">Included Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-stone-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border border-stone-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-medium text-white truncate">{item.name}</h5>
                              <span className="text-[10px] font-mono text-stone-500">
                                SKU: {item.sku} • Qty: {item.qty}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold font-mono text-stone-200">
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
                <h2 className="text-xl font-serif text-white font-medium">Profile & Security Settings</h2>
                <p className="text-xs text-stone-400 mt-1 font-light">
                  Manage your studio profile credentials, security password, and preferred settings.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-stone-400 block mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1 font-medium">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={authUser?.email || "alex.vance@northlane.studio"}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-stone-500 text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Contact studio support to request an email change.
                  </span>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1 font-medium">Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="USD ($)">USD ($) — US Dollar</option>
                    <option value="EUR (€)">EUR (€) — Euro</option>
                    <option value="GBP (£)">GBP (£) — British Pound</option>
                    <option value="CAD ($)">CAD ($) — Canadian Dollar</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-stone-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>

              {/* Password & Security Section */}
              <div className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Security & Password
                </h3>
                <p className="text-xs text-stone-400 font-light">
                  Your account is protected by Supabase SSL authentication and two-factor encrypted sessions.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => toast.info("Password reset link sent to your registered email address.")}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                  >
                    Send Password Reset Email
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
                  <h2 className="text-xl font-serif text-white font-medium">Saved Shipping Addresses</h2>
                  <p className="text-xs text-stone-400 mt-1 font-light">
                    Manage destination addresses for fast 1-click checkout delivery.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-2xl bg-stone-900/80 border transition-all relative ${
                      addr.isDefault
                        ? "border-amber-500/60 shadow-xl ring-1 ring-amber-500/20"
                        : "border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold text-white">{addr.label}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Default Address
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-300 space-y-1 font-light">
                      <p className="font-medium text-white">{addr.name}</p>
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-stone-400">{addr.country}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-amber-400 hover:underline font-medium"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-xs text-stone-500">Primary Location</span>
                      )}

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
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
                <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                      <h3 className="text-sm font-semibold text-white">Add New Address</h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-stone-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <label className="text-xs text-stone-400 block mb-1">Address Label (e.g. Home, Office)</label>
                        <input
                          type="text"
                          value={newAddrLabel}
                          onChange={(e) => setNewAddrLabel(e.target.value)}
                          placeholder="Home Studio"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400 block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={newAddrStreet}
                          onChange={(e) => setNewAddrStreet(e.target.value)}
                          placeholder="742 Evergreen Terrace"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-stone-400 block mb-1">City</label>
                          <input
                            type="text"
                            value={newAddrCity}
                            onChange={(e) => setNewAddrCity(e.target.value)}
                            placeholder="San Francisco"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-stone-400 block mb-1">State</label>
                          <input
                            type="text"
                            value={newAddrState}
                            onChange={(e) => setNewAddrState(e.target.value)}
                            placeholder="CA"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-stone-400 block mb-1">ZIP Code</label>
                          <input
                            type="text"
                            value={newAddrZip}
                            onChange={(e) => setNewAddrZip(e.target.value)}
                            placeholder="94107"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-500/60"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs"
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
                  <h2 className="text-xl font-serif text-white font-medium">Saved Payment Methods</h2>
                  <p className="text-xs text-stone-400 mt-1 font-light">
                    Manage your encrypted credit cards and digital wallets.
                  </p>
                </div>
                <button
                  onClick={() => toast.info("Stripe Payment Intent modal active during checkout flow.")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Payment Method</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {payments.map((pm) => (
                  <div
                    key={pm.id}
                    className={`p-6 rounded-2xl bg-stone-900/80 border transition-all ${
                      pm.isDefault
                        ? "border-amber-500/60 shadow-xl ring-1 ring-amber-500/20"
                        : "border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-amber-400" />
                        <div>
                          <span className="text-sm font-semibold text-white block">{pm.brand}</span>
                          <span className="text-xs font-mono text-stone-400">•••• •••• •••• {pm.last4}</span>
                        </div>
                      </div>
                      {pm.isDefault && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Default Method
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-400 font-light flex justify-between items-center pt-3 border-t border-stone-800">
                      <span>Expires {pm.expMonth}/{pm.expYear}</span>
                      <span className="text-[10px] font-mono text-stone-500">256-bit Encrypted</span>
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
                  <h2 className="text-xl font-serif text-white font-medium">AI Shopping Assistant History</h2>
                  <p className="text-xs text-stone-400 mt-1 font-light">
                    Review past recommendations, specs matching, and conversation threads with your studio AI assistant.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAiLogs([]);
                    toast.info("AI conversation history cleared.");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-xs border border-stone-800 transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-4">
                {aiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {log.topic}
                      </span>
                      <span className="font-mono text-stone-500">{log.date}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-xs text-stone-300 font-mono">
                      <span className="text-stone-500">Prompt: </span> "{log.userPrompt}"
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed font-light">{log.aiSummary}</p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-stone-500 font-mono">Recommended:</span>
                      {log.recommendedProducts.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
