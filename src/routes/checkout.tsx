import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  Loader2,
  ShoppingBag,
  Building,
  User,
  Mail,
  MapPin,
  Globe,
  Heart,
  Search,
  LogOut,
  LogIn,
  Check,
  Plus,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/cart-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { Footer } from "../components/layout/Footer";
import { SignOutConfirmModal } from "@/components/SignOutConfirmModal";
import { useAuthUser } from "@/hooks/use-auth-user";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Northlane Studio" },
      { name: "description", content: "Complete your premium workspace order securely." },
    ],
  }),
  component: CheckoutPage,
});

interface PaymentMethodItem {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

// Country to State & City mapping dictionary for dynamic form connection
const COUNTRY_LOGISTICS_DATA: Record<string, { states: string[]; defaultCity: string; defaultState: string }> = {
  "United States": {
    states: ["California (CA)", "New York (NY)", "Texas (TX)", "Florida (FL)", "Washington (WA)", "Illinois (IL)", "Oregon (OR)"],
    defaultCity: "San Francisco",
    defaultState: "CA",
  },
  "Canada": {
    states: ["Ontario (ON)", "British Columbia (BC)", "Quebec (QC)", "Alberta (AB)", "Nova Scotia (NS)"],
    defaultCity: "Toronto",
    defaultState: "ON",
  },
  "United Kingdom": {
    states: ["Greater London", "Manchester", "West Midlands", "Scotland", "Wales"],
    defaultCity: "London",
    defaultState: "Greater London",
  },
  "Australia": {
    states: ["New South Wales (NSW)", "Victoria (VIC)", "Queensland (QLD)", "Western Australia (WA)"],
    defaultCity: "Sydney",
    defaultState: "NSW",
  },
  "Germany": {
    states: ["Bavaria", "Berlin", "Hamburg", "North Rhine-Westphalia", "Hesse"],
    defaultCity: "Berlin",
    defaultState: "Berlin",
  },
  "Japan": {
    states: ["Tokyo", "Osaka", "Kyoto", "Kanagawa", "Aichi"],
    defaultCity: "Tokyo",
    defaultState: "Tokyo",
  },
  "Philippines": {
    states: ["Metro Manila", "Cebu", "Davao", "Pampanga", "Laguna", "Cavite", "Rizal"],
    defaultCity: "Manila",
    defaultState: "Metro Manila",
  },
};

const formatUSD = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function CheckoutPage() {
  const { user } = useAuthUser();
  const { items, subtotal, discountAmount, total, clearCart, itemCount, setIsOpen: openCartDrawer } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "United States",
    address: "",
    city: "San Francisco",
    state: "CA",
    zip: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "priority">("express");

  // Payment Selection State
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("new");

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expDate: "",
    cvc: "",
    nameOnCard: "",
    saveCard: true,
  });

  // Fetch wishlist items count
  useEffect(() => {
    try {
      const raw = localStorage.getItem("northlane_wishlist");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setWishlistCount(parsed.length);
      }
    } catch {}
  }, []);

  // Pre-fill user data and saved addresses
  useEffect(() => {
    if (user) {
      const rawName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      const nameParts = rawName.replace(/[^A-Za-z\s'-]/g, "").split(" ");
      setShippingInfo((prev) => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || user.email || "",
      }));
    }

    // Try loading saved addresses
    try {
      const localAddresses = localStorage.getItem("northlane_saved_addresses");
      if (localAddresses) {
        const parsed = JSON.parse(localAddresses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const def = parsed.find((a) => a.isDefault) || parsed[0];
          const nameParts = (def.recipientName || "").replace(/[^A-Za-z\s'-]/g, "").split(" ");
          const cleanZip = (def.zipCode || "").replace(/\D/g, "");
          setShippingInfo((prev) => ({
            ...prev,
            firstName: prev.firstName || nameParts[0] || "",
            lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
            address: def.streetAddress + (def.aptSuite ? `, ${def.aptSuite}` : ""),
            city: def.city || prev.city,
            state: def.state || prev.state,
            zip: cleanZip || prev.zip,
            country: def.country || prev.country,
          }));
        }
      }
    } catch {}

    // Load saved payment methods from wallet
    try {
      const localPayments = localStorage.getItem("northlane_saved_payment_methods");
      if (localPayments) {
        const parsed = JSON.parse(localPayments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPaymentMethods(parsed);
          const def = parsed.find((p: any) => p.isDefault) || parsed[0];
          if (def) {
            setSelectedPaymentMethodId(def.id);
            setPaymentInfo((prev) => ({
              ...prev,
              cardNumber: `•••• •••• •••• ${def.last4}`,
              expDate: `${String(def.expMonth).padStart(2, "0")}/${String(def.expYear).slice(-2)}`,
              nameOnCard: prev.nameOnCard || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
            }));
          }
        }
      }
    } catch {}

    // Also fetch from API if available
    fetch("http://localhost:3000/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.methods && data.methods.length > 0) {
          setSavedPaymentMethods(data.methods);
          const def = data.methods.find((p: any) => p.isDefault) || data.methods[0];
          if (def && selectedPaymentMethodId === "new") {
            setSelectedPaymentMethodId(def.id);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  // Handle Country selection change and update state/city options dynamically
  const handleCountryChange = (selectedCountry: string) => {
    const data = COUNTRY_LOGISTICS_DATA[selectedCountry];
    setShippingInfo((prev) => ({
      ...prev,
      country: selectedCountry,
      city: data ? data.defaultCity : prev.city,
      state: data ? data.defaultState : prev.state,
    }));
  };

  const shippingCost =
    shippingMethod === "standard"
      ? subtotal >= 150
        ? 0
        : 15
      : shippingMethod === "express"
      ? 25
      : 50;

  const grandTotal = total + shippingCost;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const cleanFirstName = shippingInfo.firstName.trim();
      const cleanLastName = shippingInfo.lastName.trim();
      const cleanEmail = shippingInfo.email.trim();
      const cleanAddress = shippingInfo.address.trim();
      const cleanCity = shippingInfo.city.trim();
      const cleanState = shippingInfo.state.trim();
      const cleanZip = shippingInfo.zip.trim();
      const cleanCountry = shippingInfo.country.trim();

      // Check required presence
      if (
        !cleanFirstName ||
        !cleanLastName ||
        !cleanEmail ||
        !cleanAddress ||
        !cleanCity ||
        !cleanState ||
        !cleanZip ||
        !cleanCountry
      ) {
        toast.error("All Contact & Delivery Address fields are required before proceeding.");
        return;
      }

      // Restrict First & Last Name to letters only (no numbers or special characters)
      const nameRegex = /^[A-Za-z\s'-]+$/;
      if (!nameRegex.test(cleanFirstName)) {
        toast.error("First Name must contain letters only (no numbers).");
        return;
      }
      if (!nameRegex.test(cleanLastName)) {
        toast.error("Last Name must contain letters only (no numbers).");
        return;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        toast.error("Please enter a valid Email Address (e.g. name@example.com).");
        return;
      }

      // Restrict Postal Code to numbers only (no letters or special characters)
      const zipRegex = /^\d{4,10}$/;
      if (!zipRegex.test(cleanZip)) {
        toast.error("Postal Code must contain numbers only (no letters or special characters).");
        return;
      }

      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethodId(id);
    if (id !== "new") {
      const selected = savedPaymentMethods.find((p) => p.id === id);
      if (selected) {
        setPaymentInfo((prev) => ({
          ...prev,
          cardNumber: `•••• •••• •••• ${selected.last4}`,
          expDate: `${String(selected.expMonth).padStart(2, "0")}/${String(selected.expYear).slice(-2)}`,
        }));
      }
    } else {
      setPaymentInfo((prev) => ({
        ...prev,
        cardNumber: "",
        expDate: "",
        cvc: "",
      }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPaymentMethodId === "new" && (!paymentInfo.cardNumber || !paymentInfo.expDate || !paymentInfo.cvc)) {
      toast.error("Please enter complete card details for payment authorization.");
      return;
    }

    setIsProcessing(true);

    try {
      // Call backend Payment Intent endpoint
      const response = await fetch("http://localhost:3000/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "usd",
          customerEmail: shippingInfo.email,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
        }),
      });

      if (!response.ok) {
        console.warn("Backend API endpoint offline, using client payment fallback");
      }

      // Relax card details for demonstration environment - fallback to demo values if partially entered
      const demoCardDigits = paymentInfo.cardNumber?.replace(/\s+/g, "") || "4242424242424242";
      const last4 = demoCardDigits.slice(-4) || "4242";
      const [mStr, yStr] = (paymentInfo.expDate || "12/28").split("/");
      const expMonth = parseInt(mStr, 10) || 12;
      const expYear = parseInt(yStr, 10) || 2028;
      const brand = demoCardDigits.startsWith("4") ? "Visa" : demoCardDigits.startsWith("5") ? "Mastercard" : "Visa";

      if (selectedPaymentMethodId === "new" && paymentInfo.saveCard) {
        const newMethod: PaymentMethodItem = {
          id: `pm-${Date.now()}`,
          brand,
          last4,
          expMonth,
          expYear,
          isDefault: savedPaymentMethods.length === 0,
        };

        const updatedWallet = [...savedPaymentMethods, newMethod];
        try {
          localStorage.setItem("northlane_saved_payment_methods", JSON.stringify(updatedWallet));
        } catch {}

        try {
          await fetch("http://localhost:3000/api/payment/methods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brand, last4, expMonth, expYear, isDefault: false }),
          });
        } catch {}
      }

      const orderId = `NL-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `DHL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const formattedAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}, ${shippingInfo.country}`;
      const estimatedDelivery = shippingMethod === "express" ? "3-4 Business Days" : "5-7 Business Days";

      // 1. Get authenticated user if available
      const { data: userRes } = await supabase.auth.getUser();
      const currentUserId = userRes?.user?.id || null;

      // 2. Insert into Supabase 'orders' table
      try {
        const { error: orderError } = await (supabase as any).from("orders").insert({
          id: orderId,
          user_id: currentUserId,
          status: "Placed",
          total: grandTotal,
          timeline_step: 1,
          carrier: shippingMethod === "express" ? "DHL Express" : "FedEx Ground",
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          shipping_address: formattedAddress,
        });

        if (orderError) {
          console.warn("[Checkout] Supabase orders table notice:", orderError.message);
        }

        // 3. Insert into Supabase 'order_items' table
        if (items.length > 0) {
          const itemPayloads = items.map((it) => ({
            order_id: orderId,
            product_id: it.id,
            product_name: it.name,
            product_image: it.image || "",
            sku: it.sku || `NL-${it.id.toUpperCase()}`,
            price: it.price,
            quantity: it.quantity,
          }));

          const { error: itemsError } = await (supabase as any).from("order_items").insert(itemPayloads);
          if (itemsError) {
            console.warn("[Checkout] Supabase order_items notice:", itemsError.message);
          }
        }
      } catch (dbErr) {
        console.warn("[Checkout] Database write fallback to local storage:", dbErr);
      }

      // 4. Formulate complete local order structure for immediate UI sync
      const orderSummary = {
        id: orderId,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        total: grandTotal,
        status: "Placed",
        carrier: shippingMethod === "express" ? "DHL Express" : "FedEx Ground",
        trackingNumber: trackingNumber,
        estimatedDelivery: estimatedDelivery,
        shippingAddress: formattedAddress,
        timelineStep: 1,
        items: items.map((it) => ({
          id: `order-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: it.id,
          name: it.name,
          price: it.price,
          qty: it.quantity,
          image: it.image,
          sku: it.sku || `NL-${it.id.toUpperCase()}`,
        })),
      };

      // Store in northlane_user_orders & northlane_last_order
      try {
        const storedOrders = localStorage.getItem("northlane_user_orders");
        const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
        localStorage.setItem("northlane_user_orders", JSON.stringify([orderSummary, ...parsedOrders]));
        localStorage.setItem("northlane_last_order", JSON.stringify(orderSummary));
      } catch {}

      // 5. Dispatch Luxury Confirmation Email via Backend API
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        await fetch(`${apiUrl}/api/automation/send-order-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            customerEmail: shippingInfo.email,
            customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim() || "Valued Client",
            items: items.map((it) => ({
              id: it.id,
              name: it.name,
              price: it.price,
              qty: it.quantity,
              image: it.image,
              sku: it.sku || `NL-${it.id.toUpperCase()}`,
            })),
            subtotal,
            discount: Math.max(0, subtotal - total),
            shipping: shippingCost,
            grandTotal,
            shippingAddress: formattedAddress,
            trackingNumber,
            carrier: shippingMethod === "express" ? "DHL Express" : "FedEx Ground",
            estimatedDelivery,
          }),
        });
      } catch (emailErr) {
        console.warn("[Checkout] Confirmation email dispatch notice:", emailErr);
      }

      // Dispatch event for any active tabs
      try {
        window.dispatchEvent(new CustomEvent("northlane_order_created", { detail: orderSummary }));
      } catch {}

      clearCart();
      toast.success(`Order #${orderId} Placed Successfully!`, {
        description: `Demonstration purchase registered. Tracking #${trackingNumber} created.`,
      });

      // Navigate to Account Orders tracking hub
      navigate({ to: "/account/orders" });
    } catch (err) {
      console.error("Order creation fallback error:", err);
      const orderId = `NL-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `DHL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const formattedAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}, ${shippingInfo.country}`;
      const orderSummary = {
        id: orderId,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        total: grandTotal,
        status: "Placed",
        carrier: "DHL Express",
        trackingNumber: trackingNumber,
        estimatedDelivery: "3-5 Business Days",
        shippingAddress: formattedAddress,
        timelineStep: 1,
        items: items.map((it) => ({
          id: `order-item-${Date.now()}`,
          productId: it.id,
          name: it.name,
          price: it.price,
          qty: it.quantity,
          image: it.image,
          sku: it.sku || `NL-${it.id.toUpperCase()}`,
        })),
      };
      try {
        const storedOrders = localStorage.getItem("northlane_user_orders");
        const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
        localStorage.setItem("northlane_user_orders", JSON.stringify([orderSummary, ...parsedOrders]));
        localStorage.setItem("northlane_last_order", JSON.stringify(orderSummary));
      } catch {}
      clearCart();
      toast.success(`Order #${orderId} Placed Successfully!`, {
        description: `Demonstration purchase completed.`,
      });
      navigate({ to: "/account/orders" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
        {/* Navigation Header (100% Identical to /shop) */}
        <header className="sticky top-0 z-50 border-b border-hairline bg-background/90 backdrop-blur-xl transition-all duration-300">
          <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
            <Link
              to="/"
              className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
            >
              <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
              <span>Northlane</span>
            </Link>

            <nav className="hidden justify-center gap-8 lg:flex text-sm font-medium text-muted-foreground">
              <Link to="/shop" className="hover:text-foreground transition-colors">
                Shop
              </Link>
              <a href="/#collections" className="hover:text-foreground transition-colors">
                Collections
              </a>
              <a href="/#concierge" className="hover:text-foreground transition-colors">
                Concierge
              </a>
              <a href="/#workspaces" className="hover:text-foreground transition-colors">
                Workspaces
              </a>
              <a href="/#journal" className="hover:text-foreground transition-colors">
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

              <button
                onClick={() => openCartDrawer(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                    : user?.user_metadata?.picture || "";

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
              <a href="/#collections" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                Collections
              </a>
              <a href="/#concierge" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                Concierge
              </a>
              <a href="/#workspaces" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                Workspaces
              </a>
              <a href="/#journal" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                Journal
              </a>
            </div>
          )}
        </header>

        <div className="max-w-md mx-auto text-center space-y-4 py-20 px-4">
          <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground opacity-40" />
          <h2 className="text-xl font-bold tracking-tight">Your studio bag is empty</h2>
          <p className="text-xs text-muted-foreground">Add items to your bag before proceeding to checkout.</p>
          <Button onClick={() => navigate({ to: "/shop" })} className="rounded-full px-6 py-2.5 bg-foreground text-background font-bold text-xs">
            Return to Shop Catalog
          </Button>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20">
      {/* Navigation Header (100% Identical to /shop) */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-background/90 backdrop-blur-xl transition-all duration-300">
        <div className="container-editorial flex items-center justify-between py-3.5 sm:py-4">
          <Link
            to="/"
            className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <img src="/northlane-logo.png" alt="Northlane" className="h-8 w-8 rounded-md object-cover" />
            <span>Northlane</span>
          </Link>

          <nav className="hidden justify-center gap-8 lg:flex text-sm font-medium text-muted-foreground">
            <Link to="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <a href="/#collections" className="hover:text-foreground transition-colors">
              Collections
            </a>
            <a href="/#concierge" className="hover:text-foreground transition-colors">
              Concierge
            </a>
            <a href="/#workspaces" className="hover:text-foreground transition-colors">
              Workspaces
            </a>
            <a href="/#journal" className="hover:text-foreground transition-colors">
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

            <button
              onClick={() => openCartDrawer(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  : user?.user_metadata?.picture || "";

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
            <a href="/#collections" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Collections
            </a>
            <a href="/#concierge" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Concierge
            </a>
            <a href="/#workspaces" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Workspaces
            </a>
            <a href="/#journal" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
              Journal
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-editorial py-8 sm:py-12 flex-1 w-full">
        {/* Improved Progress Tracker Layout */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between relative px-4">
            <div className="absolute left-10 right-10 top-4 -translate-y-1/2 h-0.5 bg-hairline z-0" />
            <div
              className="absolute left-10 top-4 -translate-y-1/2 h-0.5 bg-foreground transition-all duration-300 z-0"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-background px-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? "bg-foreground text-background ring-4 ring-background shadow-xs"
                    : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                Contact & Address
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-background px-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? "bg-foreground text-background ring-4 ring-background shadow-xs"
                    : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                Delivery Method
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2 bg-background px-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? "bg-foreground text-background ring-4 ring-background shadow-xs"
                    : "bg-surface border border-hairline text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step === 3 ? "text-foreground" : "text-muted-foreground"}`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Contact & Delivery Address Form */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (7 cols): Contact & Address Form Card */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-6 rounded-3xl border border-hairline bg-surface/40 p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-hairline pb-4">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" /> Contact & Delivery Address
                    </h2>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      All Fields Required *
                    </span>
                  </div>

                  {/* 1. First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-bold">
                        First Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            firstName: e.target.value.replace(/[^A-Za-z\s'-]/g, ""),
                          })
                        }
                        placeholder="e.g. Alex"
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-bold">
                        Last Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            lastName: e.target.value.replace(/[^A-Za-z\s'-]/g, ""),
                          })
                        }
                        placeholder="e.g. Morgan"
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  {/* 2. Email Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold">
                      Email Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      placeholder="alex.morgan@example.com"
                      required
                      className="bg-background text-xs rounded-xl"
                    />
                  </div>

                  {/* 3. Country */}
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-bold flex items-center justify-between">
                      <span>Country / Region <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-muted-foreground font-normal">Connected to City & Province options</span>
                    </Label>
                    <select
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      required
                      className="w-full bg-background text-xs rounded-xl border border-hairline px-3 py-2.5 font-medium text-foreground focus:outline-none focus:border-foreground transition-colors cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                      <option value="Philippines">Philippines</option>
                    </select>
                  </div>

                  {/* 4. Street Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-bold">
                      Street Address & Unit/Suite <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder="742 Evergreen Terrace, Suite 4B"
                      required
                      className="bg-background text-xs rounded-xl"
                    />
                  </div>

                  {/* 5. City, State / Province, Postal Code */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-bold">
                        City <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder="San Francisco"
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-bold">
                        State / Province <span className="text-rose-500">*</span>
                      </Label>
                      {COUNTRY_LOGISTICS_DATA[shippingInfo.country] ? (
                        <select
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          required
                          className="w-full bg-background text-xs rounded-xl border border-hairline px-3 py-2 font-medium text-foreground focus:outline-none focus:border-foreground cursor-pointer"
                        >
                          {COUNTRY_LOGISTICS_DATA[shippingInfo.country].states.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          placeholder="CA"
                          required
                          className="bg-background text-xs rounded-xl"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="zip" className="text-xs font-bold">
                        Postal Code <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            zip: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="94107"
                        required
                        className="bg-background text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Order Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-hairline bg-surface/40 p-6 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-hairline pb-3">
                    Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </h3>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 divide-y divide-hairline">
                    {items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl border border-hairline object-cover bg-surface shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground">${formatUSD(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-hairline pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">${formatUSD(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-semibold">
                        <span>Discount</span>
                        <span>-${formatUSD(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Method</span>
                      <span className="font-semibold text-foreground">
                        {shippingCost === 0 ? "Free" : `$${formatUSD(shippingCost)}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-hairline pt-3 text-sm font-bold text-foreground">
                      <span>Total Due</span>
                      <span className="text-accent">${formatUSD(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Row: Below BOTH Containers! Left: Return to Bag. Right: Continue Button (Aligned under Order Summary right corner) */}
            <div className="pt-4 flex items-center justify-between">
              <Link to="/cart" className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Return to Bag
              </Link>
              <Button type="submit" className="rounded-full px-6 py-3 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs cursor-pointer shadow-md ml-auto">
                Continue to Delivery Option <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Select Delivery Option */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (7 cols): Delivery Option Card */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-6 rounded-3xl border border-hairline bg-surface/40 p-6 sm:p-8">
                  <div className="border-b border-hairline pb-4">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                      <Truck className="h-4 w-4 text-accent" /> Select Delivery Option
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Choose your preferred logistics option for insured studio delivery.
                    </p>
                  </div>

                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={(v) => setShippingMethod(v as any)}
                    className="space-y-3"
                  >
                    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${shippingMethod === "standard" ? "border-foreground bg-background shadow-xs" : "border-hairline bg-surface/50 hover:border-foreground/30"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">Standard Ground Courier</p>
                          <p className="text-xs text-muted-foreground">3–5 Business Days (Tracked Ground Dispatch)</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {subtotal >= 150 ? "FREE" : "$15.00"}
                      </span>
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${shippingMethod === "express" ? "border-foreground bg-background shadow-xs" : "border-hairline bg-surface/50 hover:border-foreground/30"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" id="express" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                            Express Air Freight <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">RECOMMENDED</span>
                          </p>
                          <p className="text-xs text-muted-foreground">1–2 Business Days with Priority Air Logistics</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground">$25.00</span>
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${shippingMethod === "priority" ? "border-foreground bg-background shadow-xs" : "border-hairline bg-surface/50 hover:border-foreground/30"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="priority" id="priority" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">Curated White-Glove Setup & Unboxing</p>
                          <p className="text-xs text-muted-foreground">Scheduled Morning Delivery & Professional Studio Assembly</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground">$50.00</span>
                    </label>
                  </RadioGroup>
                </div>
              </div>

              {/* Right Column (5 cols): Order Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-hairline bg-surface/40 p-6 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-hairline pb-3">
                    Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </h3>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 divide-y divide-hairline">
                    {items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl border border-hairline object-cover bg-surface shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground">${formatUSD(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-hairline pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">${formatUSD(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-semibold">
                        <span>Discount</span>
                        <span>-${formatUSD(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Method</span>
                      <span className="font-semibold text-foreground">
                        {shippingCost === 0 ? "Free" : `$${formatUSD(shippingCost)}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-hairline pt-3 text-sm font-bold text-foreground">
                      <span>Total Due</span>
                      <span className="text-accent">${formatUSD(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Row: Below BOTH Containers! Left: Back to Contact & Address. Right: Continue Button (Aligned under Order Summary right corner) */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Contact & Address
              </button>
              <Button type="submit" className="rounded-full px-6 py-3 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs cursor-pointer shadow-md ml-auto">
                Continue to Payment <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Payment Details Form */}
        {step === 3 && (
          <form onSubmit={handlePlaceOrder} className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (7 cols): Payment Details Card */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-6 rounded-3xl border border-hairline bg-surface/40 p-6 sm:p-8">
                  <div className="flex justify-between items-center border-b border-hairline pb-4">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-accent" /> Payment Details
                    </h2>
                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> SSL 256-bit Encryption
                    </span>
                  </div>

                  {/* Demonstration Environment Notice Banner */}
                  <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-accent/10 text-accent shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p className="font-bold text-foreground tracking-tight">
                        Demonstration Environment Active
                      </p>
                      <p className="leading-relaxed">
                        This store is in demo mode. <strong>No real money will be charged or deducted</strong> from your bank account or card. You may enter any test numbers or leave default demo values.
                      </p>
                    </div>
                  </div>

                  {/* Saved Cards Selection from Wallet */}
                  {savedPaymentMethods.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Saved Wallet Method:
                      </span>
                      <div className="space-y-2">
                        {savedPaymentMethods.map((pm) => (
                          <label
                            key={pm.id}
                            onClick={() => handleSelectPaymentMethod(pm.id)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              selectedPaymentMethodId === pm.id
                                ? "border-foreground bg-background shadow-xs"
                                : "border-hairline bg-surface/60 hover:border-foreground/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedPaymentMethodId === pm.id ? "border-foreground bg-foreground text-background" : "border-muted-foreground"}`}>
                                {selectedPaymentMethodId === pm.id && <Check className="h-2.5 w-2.5" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-accent" />
                                <span className="text-xs font-bold text-foreground">
                                  {pm.brand} ending in •••• {pm.last4}
                                </span>
                                {pm.isDefault && (
                                  <span className="text-[9px] font-bold uppercase bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Exp {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
                            </span>
                          </label>
                        ))}

                        <label
                          onClick={() => handleSelectPaymentMethod("new")}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            selectedPaymentMethodId === "new"
                              ? "border-foreground bg-background shadow-xs"
                              : "border-hairline bg-surface/60 hover:border-foreground/30"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedPaymentMethodId === "new" ? "border-foreground bg-foreground text-background" : "border-muted-foreground"}`}>
                            {selectedPaymentMethodId === "new" && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5 text-accent" /> Enter New Credit or Debit Card
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Manual Card Entry Fields (If New Card Selected or No Saved Cards) */}
                  {selectedPaymentMethodId === "new" && (
                    <div className="space-y-4 pt-3 border-t border-hairline/60">
                      <div className="space-y-1.5">
                        <Label htmlFor="cardName" className="text-xs font-bold">
                          Cardholder Name
                        </Label>
                        <Input
                          id="cardName"
                          value={paymentInfo.nameOnCard}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              nameOnCard: e.target.value.replace(/[^A-Za-z\s'-]/g, ""),
                            })
                          }
                          placeholder="e.g. Alex Morgan (or any name)"
                          className="bg-background text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cardNumber" className="text-xs font-bold">
                            Card Number
                          </Label>
                          <span className="text-[10px] text-accent font-medium">Demo: Any numbers allowed</span>
                        </div>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                            placeholder="4242 4242 4242 4242 (or any digits)"
                            className="bg-background text-xs rounded-xl pr-10"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="expDate" className="text-xs font-bold">
                            Expiration Date
                          </Label>
                          <Input
                            id="expDate"
                            placeholder="MM/YY (e.g. 12/28)"
                            value={paymentInfo.expDate}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, expDate: e.target.value })}
                            className="bg-background text-xs rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cvc" className="text-xs font-bold">
                            CVC / CVV
                          </Label>
                          <Input
                            id="cvc"
                            placeholder="3 digits (e.g. 123)"
                            value={paymentInfo.cvc}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cvc: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="bg-background text-xs rounded-xl"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentInfo.saveCard}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                          className="rounded text-accent focus:ring-accent"
                        />
                        <span>Save card to my demo wallet</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Order Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-hairline bg-surface/40 p-6 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider border-b border-hairline pb-3">
                    Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </h3>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 divide-y divide-hairline">
                    {items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl border border-hairline object-cover bg-surface shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground">${formatUSD(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-hairline pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">${formatUSD(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-semibold">
                        <span>Discount</span>
                        <span>-${formatUSD(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Method</span>
                      <span className="font-semibold text-foreground">
                        {shippingCost === 0 ? "Free" : `$${formatUSD(shippingCost)}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-hairline pt-3 text-sm font-bold text-foreground">
                      <span>Total Due</span>
                      <span className="text-accent">${formatUSD(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Row: Below BOTH Containers! Left: Back to Delivery Option. Right: Pay Button (Aligned under Order Summary right corner) */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isProcessing}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Delivery Option
              </button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-3.5 font-bold text-xs cursor-pointer shadow-lg ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing Payment...
                  </>
                ) : (
                  <>
                    Pay ${formatUSD(grandTotal)}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>

      <Footer />
      <SignOutConfirmModal isOpen={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
    </div>
  );
}
