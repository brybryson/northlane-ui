import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Truck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import productKeyboard from "@/assets/product-keyboard.jpg";
import productMouse from "@/assets/product-mouse.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLamp from "@/assets/product-lamp.jpg";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({
    meta: [
      { title: "Orders & Package Tracking — Northlane Studio" },
      { name: "description", content: "Inspect real-time shipment status, tracking numbers, and order item details." },
    ],
  }),
  component: OrdersPage,
});

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
  timelineStep: number;
}

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
      {
        id: "prod-mouse-precision",
        name: "Precision Ergonomic Wireless Mouse",
        price: 115,
        qty: 1,
        image: productMouse,
        sku: "NL-MS-PRO",
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

function OrdersPage() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [orderFilter, setOrderFilter] = useState<"All" | "In Transit" | "Processing" | "Delivered">("All");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({
    "NL-89210": true,
    "NL-87402": false,
  });
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    toast.success("Tracking number copied to clipboard!");
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleItemsExpanded = (orderId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredOrders = orders.filter(
    (o) => orderFilter === "All" || o.status === orderFilter
  );

  return (
    <div className="space-y-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account Overview</span>
      </Link>

      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Order History
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Package Tracking & History
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Track shipments in real-time or inspect past order details.
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-bold text-muted-foreground mr-1">Status Filter:</span>
        {(["All", "In Transit", "Processing", "Delivered"] as const).map((st) => (
          <button
            key={st}
            onClick={() => setOrderFilter(st)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              orderFilter === st
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "bg-surface text-muted-foreground border-hairline hover:text-foreground"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List / Empty Filter State */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-background border border-hairline space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface text-muted-foreground mx-auto flex items-center justify-center border border-hairline">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">No Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are currently no orders matching the "{orderFilter}" filter.
          </p>
          <button
            onClick={() => setOrderFilter("All")}
            className="mt-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer"
          >
            View All Orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id] ?? (order.status !== "Delivered");
            const isItemsExpanded = expandedItems[order.id] ?? false;
            const visibleItems = isItemsExpanded ? order.items : order.items.slice(0, 3);
            const hiddenCount = order.items.length - 3;

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-background border border-hairline overflow-hidden shadow-xs space-y-0 transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-6 bg-surface/50 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">
                        Order ID
                      </span>
                      <span className="text-sm font-bold tracking-tight text-foreground">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">
                        Date
                      </span>
                      <span className="text-xs text-foreground font-semibold">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">
                        Total Paid
                      </span>
                      <span className="text-xs font-bold text-foreground">${order.total}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.success(`Invoice PDF downloaded for ${order.id}`)}
                        className="p-2 rounded-full bg-background hover:bg-surface text-foreground transition-colors border border-hairline cursor-pointer"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleOrderExpanded(order.id)}
                        className="px-3 py-1.5 rounded-full bg-background hover:bg-surface text-foreground text-xs font-semibold transition-colors border border-hairline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "Minimize" : "Details"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Order Details Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Minimal Delivery Progress Bar */}
                      <div className="p-4 sm:p-6 bg-background border-b border-hairline space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-accent shrink-0" />
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
                            Est. Delivery: <strong className="text-foreground font-semibold">{order.estimatedDelivery}</strong>
                          </span>
                        </div>

                        {/* Simple Clean Progress Line Bar */}
                        <div className="space-y-2 pt-1">
                          <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-surface border border-hairline">
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
                              className="bg-foreground transition-all duration-500 rounded-full"
                            />
                          </div>
                          <div className="grid grid-cols-4 text-center">
                            {[
                              { step: 1, label: "Placed" },
                              { step: 2, label: "Processing" },
                              { step: 3, label: "In Transit" },
                              { step: 4, label: "Delivered" },
                            ].map((s) => (
                              <span
                                key={s.step}
                                className={`text-[11px] font-medium transition-colors ${
                                  order.timelineStep >= s.step ? "text-foreground font-bold" : "text-muted-foreground/60"
                                }`}
                              >
                                {s.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Order Items List */}
                      <div className="p-4 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Included Items ({order.items.length})
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {visibleItems.map((item) => (
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
                                  <h5 className="text-xs font-bold tracking-tight text-foreground truncate">
                                    {item.name}
                                  </h5>
                                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-semibold">
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

                        {/* See More Items Toggle Button */}
                        {hiddenCount > 0 && (
                          <div className="pt-2 text-center">
                            <button
                              onClick={() => toggleItemsExpanded(order.id)}
                              className="px-4 py-2 rounded-full bg-surface hover:bg-muted/60 text-foreground text-xs font-semibold border border-hairline transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>
                                {isItemsExpanded ? "Show Less Items" : `+ ${hiddenCount} More Items — View All`}
                              </span>
                              {isItemsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
