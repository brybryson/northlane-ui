import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search, Download, Plus, RefreshCw, SlidersHorizontal,
  X, ChevronLeft, Package, MapPin, Clock, CheckCircle2,
  Truck, AlertCircle, RotateCcw, Sparkles, Zap,
  ChevronDown, Send, Phone, Mail, User, FileText,
  Ban, DollarSign, ArrowUpRight, MoreHorizontal,
  Circle, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
type PaymentStatus = "Awaiting Payment" | "Paid" | "Failed" | "Refunded" | "Partially Refunded";
type FulfillmentStatus = "Pending" | "Preparing" | "Packed" | "Ready to Ship" | "Shipped" | "Delivered" | "Completed";
type Priority = "High" | "Normal" | "Low";

interface OrderLineItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

interface TimelineEvent {
  time: string;
  label: string;
  by: string;
  type: "success" | "info" | "warning" | "system";
}

interface CustomerRequest {
  type: string;
  requestedBy: string;
  date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  customerSince: string;
  totalOrders: number;
  lifetimeValue: number;
  tags: string[];
  shippingAddress: string;
  billingAddress: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderLineItem[];
  shipping: number;
  tax: number;
  discount: number;
  date: string;
  priority: Priority;
  assignedStaff: string;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  timeline: TimelineEvent[];
  requests: CustomerRequest[];
  aiInsights: string[];
}

/* ──────────────────────────────────────────────
   Mock Data (20 realistic orders)
────────────────────────────────────────────── */
const MOCK_ORDERS: Order[] = [
  {
    id: "#NL-1042", customer: "Marcus Reyes", email: "marcus.r@example.com", phone: "+63 917 123 4567",
    customerSince: "Jan 2024", totalOrders: 7, lifetimeValue: 42850, tags: ["VIP", "Repeat"],
    shippingAddress: "12B Emerald Ave, BGC, Taguig, Metro Manila 1634",
    billingAddress: "12B Emerald Ave, BGC, Taguig, Metro Manila 1634",
    paymentStatus: "Paid", fulfillmentStatus: "Preparing",
    items: [
      { id: "kb-02", name: "Keycult No.2 TKL", sku: "KB-02", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80", qty: 1, unitPrice: 28500, discount: 0 },
      { id: "ac-01", name: "Walnut Desk Mat", sku: "AC-01", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80", qty: 2, unitPrice: 1200, discount: 200 },
    ],
    shipping: 0, tax: 1790, discount: 200, date: "Today, 10:31 AM", priority: "High",
    assignedStaff: "Ana Cruz", carrier: "LBC Express", trackingNumber: undefined,
    timeline: [
      { time: "10:31 AM", label: "Order Placed", by: "Marcus Reyes", type: "info" },
      { time: "10:33 AM", label: "Payment Confirmed $312.90", by: "Stripe", type: "success" },
      { time: "10:34 AM", label: "Inventory Reserved (3 items)", by: "System", type: "system" },
      { time: "10:50 AM", label: "Assigned to Ana Cruz", by: "Admin", type: "info" },
    ],
    requests: [], aiInsights: ["Returning VIP Customer", "High Lifetime Value ($428.50)", "Frequently Purchases Accessories", "Low Refund Risk"],
  },
  {
    id: "#NL-1041", customer: "Sofia Tan", email: "sofia.tan@example.com", phone: "+1 415 234 5678",
    customerSince: "Mar 2025", totalOrders: 2, lifetimeValue: 190, tags: ["New"],
    shippingAddress: "742 Evergreen Terrace, San Francisco, CA 94107",
    billingAddress: "742 Evergreen Terrace, San Francisco, CA 94107",
    paymentStatus: "Paid", fulfillmentStatus: "Pending",
    items: [
      { id: "ms-01", name: "Logitech MX Master 3S", sku: "MS-01", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80", qty: 1, unitPrice: 99, discount: 0 },
    ],
    shipping: 15, tax: 8, discount: 0, date: "Today, 09:12 AM", priority: "Normal",
    assignedStaff: "—",
    timeline: [
      { time: "09:12 AM", label: "Order Placed", by: "Sofia Tan", type: "info" },
      { time: "09:13 AM", label: "Payment Confirmed $122.00", by: "Stripe", type: "success" },
    ],
    requests: [], aiInsights: ["New Customer — 2nd Order", "Suggest Welcome Loyalty Offer", "Standard Refund Risk"],
  },
  {
    id: "#NL-1040", customer: "Daniel Lim", email: "d.lim@example.com", phone: "+1 415 345 6789",
    customerSince: "Aug 2023", totalOrders: 14, lifetimeValue: 2450, tags: ["VIP", "Studio Pro"],
    shippingAddress: "120 Market St, Suite 400, San Francisco, CA 94105",
    billingAddress: "120 Market St, Suite 400, San Francisco, CA 94105",
    paymentStatus: "Paid", fulfillmentStatus: "Shipped",
    items: [
      { id: "dk-01", name: "Northlane Lift Standing Desk", sku: "DK-01", image: "https://images.unsplash.com/photo-1593642534315-48ec5d3d4124?w=80", qty: 1, unitPrice: 750, discount: 50 },
    ],
    shipping: 0, tax: 60, discount: 50, date: "Yesterday, 4:45 PM", priority: "High",
    assignedStaff: "Ben Santos", carrier: "FedEx Express", trackingNumber: "FX-US-9928371",
    timeline: [
      { time: "Yesterday 4:45 PM", label: "Order Placed", by: "Daniel Lim", type: "info" },
      { time: "Yesterday 4:46 PM", label: "Payment Confirmed $760.00", by: "Stripe", type: "success" },
      { time: "Yesterday 5:00 PM", label: "Packing Started", by: "Ben Santos", type: "info" },
      { time: "Yesterday 7:30 PM", label: "Tracking Generated: FX-US-9928371", by: "System", type: "system" },
      { time: "Today 8:00 AM", label: "Order Handed to FedEx Express", by: "Ben Santos", type: "success" },
    ],
    requests: [], aiInsights: ["Studio Pro Member", "14 Lifetime Orders", "Bundle Recommendation Accepted (3×)", "Eligible for Priority Handling"],
  },
  {
    id: "#NL-1039", customer: "Isabella Ramos", email: "i.ramos@example.com", phone: "+1 415 456 7890",
    customerSince: "Nov 2024", totalOrders: 3, lifetimeValue: 420, tags: [],
    shippingAddress: "450 Sutter St, San Francisco, CA 94108",
    billingAddress: "450 Sutter St, San Francisco, CA 94108",
    paymentStatus: "Refunded", fulfillmentStatus: "Completed",
    items: [
      { id: "au-02", name: "Sony WH-1000XM5", sku: "AU-02", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80", qty: 1, unitPrice: 380, discount: 0 },
    ],
    shipping: 0, tax: 30, discount: 0, date: "Yesterday, 2:30 PM", priority: "Low",
    assignedStaff: "Ana Cruz",
    timeline: [
      { time: "Yesterday 2:30 PM", label: "Order Placed", by: "Isabella Ramos", type: "info" },
      { time: "Yesterday 2:31 PM", label: "Payment Confirmed $410.00", by: "Stripe", type: "success" },
      { time: "Yesterday 6:00 PM", label: "Return Requested — Defective Unit", by: "Isabella Ramos", type: "warning" },
      { time: "Yesterday 6:30 PM", label: "Return Approved", by: "Ana Cruz", type: "info" },
      { time: "Today 9:00 AM", label: "Refund Processed $410.00", by: "System", type: "success" },
    ],
    requests: [
      { type: "Return Request", requestedBy: "Isabella Ramos", date: "Yesterday 6:00 PM", reason: "Unit arrived with crackling in left earcup.", status: "Approved" },
    ],
    aiInsights: ["Refund Processed — Closed", "Defective Unit Logged", "Suggest Replacement Offer"],
  },
  {
    id: "#NL-1038", customer: "Kevin Morales", email: "kevin.m@example.com", phone: "+63 916 567 8901",
    customerSince: "Feb 2025", totalOrders: 1, lifetimeValue: 3800, tags: ["First Order"],
    shippingAddress: "123 Mabini St, Iloilo City, 5000",
    billingAddress: "123 Mabini St, Iloilo City, 5000",
    paymentStatus: "Awaiting Payment", fulfillmentStatus: "Pending",
    items: [
      { id: "ms-02", name: "Razer DeathAdder V3", sku: "MS-02", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80", qty: 1, unitPrice: 3800, discount: 0 },
    ],
    shipping: 200, tax: 228, discount: 0, date: "May 14, 2025", priority: "Low",
    assignedStaff: "—",
    timeline: [
      { time: "May 14, 12:00 PM", label: "Order Placed", by: "Kevin Morales", type: "info" },
      { time: "May 14, 12:01 PM", label: "Awaiting Bank Transfer Payment", by: "System", type: "warning" },
    ],
    requests: [], aiInsights: ["First-Time Customer", "High Abandonment Risk — Payment Pending 24h+", "Recommend Payment Reminder Email"],
  },
  {
    id: "#NL-1037", customer: "Chloe Aquino", email: "c.aquino@example.com", phone: "+63 912 678 9012",
    customerSince: "Jun 2024", totalOrders: 5, lifetimeValue: 22000, tags: ["Repeat"],
    shippingAddress: "88 Katipunan Ave, QC, Metro Manila, 1108",
    billingAddress: "88 Katipunan Ave, QC, Metro Manila, 1108",
    paymentStatus: "Paid", fulfillmentStatus: "Ready to Ship",
    items: [
      { id: "mn-01", name: "LG UltraWide 34\"", sku: "MN-01", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80", qty: 1, unitPrice: 24500, discount: 1500 },
    ],
    shipping: 0, tax: 1380, discount: 1500, date: "May 14, 2025", priority: "Normal",
    assignedStaff: "Ben Santos", carrier: "LBC Express",
    timeline: [
      { time: "May 14, 9:00 AM", label: "Order Placed", by: "Chloe Aquino", type: "info" },
      { time: "May 14, 9:02 AM", label: "Payment Confirmed $243.80", by: "Stripe", type: "success" },
      { time: "May 14, 2:00 PM", label: "Packed & Ready for Pickup", by: "Ben Santos", type: "success" },
    ],
    requests: [], aiInsights: ["Returning Customer (5 Orders)", "Accessories Upsell Opportunity", "Preferred Carrier: LBC"],
  },
  {
    id: "#NL-1036", customer: "Ethan dela Cruz", email: "ethan.dc@example.com", phone: "+1 415 789 0123",
    customerSince: "Sep 2023", totalOrders: 9, lifetimeValue: 1250, tags: ["VIP"],
    shippingAddress: "555 California St, San Francisco, CA 94104",
    billingAddress: "555 California St, San Francisco, CA 94104",
    paymentStatus: "Paid", fulfillmentStatus: "Delivered",
    items: [
      { id: "ch-01", name: "HM Embody Chair", sku: "CH-01", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=80", qty: 1, unitPrice: 1200, discount: 100 },
    ],
    shipping: 0, tax: 88, discount: 100, date: "May 12, 2025", priority: "High",
    assignedStaff: "Ana Cruz", carrier: "FedEx Express",
    timeline: [
      { time: "May 12, 3:00 PM", label: "Order Placed", by: "Ethan dela Cruz", type: "info" },
      { time: "May 12, 3:02 PM", label: "Payment Confirmed $1,188.00", by: "Stripe", type: "success" },
      { time: "May 13, 9:00 AM", label: "Dispatched via FedEx Express", by: "System", type: "system" },
      { time: "May 13, 2:30 PM", label: "Delivered & Signed", by: "FedEx Express", type: "success" },
    ],
    requests: [], aiInsights: ["VIP — 9 Lifetime Orders", "Likely to Purchase Studio Upgrade Bundle", "No Refund History"],
  },
  {
    id: "#NL-1035", customer: "Natasha Villanueva", email: "n.villanueva@example.com", phone: "+63 921 890 1234",
    customerSince: "Apr 2025", totalOrders: 1, lifetimeValue: 5200, tags: ["First Order"],
    shippingAddress: "Cebu Business Park, Cebu City, 6000",
    billingAddress: "Cebu Business Park, Cebu City, 6000",
    paymentStatus: "Failed", fulfillmentStatus: "Pending",
    items: [
      { id: "kb-01", name: "HHKB Professional Hybrid", sku: "KB-01", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80", qty: 1, unitPrice: 15800, discount: 0 },
    ],
    shipping: 250, tax: 942, discount: 0, date: "May 10, 2025", priority: "Low",
    assignedStaff: "—",
    timeline: [
      { time: "May 10, 11:00 AM", label: "Order Placed", by: "Natasha Villanueva", type: "info" },
      { time: "May 10, 11:02 AM", label: "Payment Failed — Card Declined", by: "Stripe", type: "warning" },
    ],
    requests: [], aiInsights: ["Payment Failed — Follow-up Required", "Suggest Retry or Alternative Payment Method"],
  },
];

// Fill remaining orders with variations
for (let i = 1034; i >= 1024; i--) {
  const statuses: FulfillmentStatus[] = ["Preparing", "Shipped", "Pending", "Completed", "Packed"];
  const payStatuses: PaymentStatus[] = ["Paid", "Paid", "Paid", "Awaiting Payment", "Refunded"];
  const customers = ["Ryan Park", "Mei Santos", "Alex Gomez", "Jill Torres", "Noah Kim", "Luna Rivera", "Mia Castillo", "Ben Ong", "Yara Lopez", "Drew Diaz", "Karl Basa"];
  const idx = 1034 - i;
  MOCK_ORDERS.push({
    id: `#NL-${i}`,
    customer: customers[idx] ?? "Guest",
    email: `${customers[idx]?.toLowerCase().replace(" ", ".") ?? "guest"}@example.com`,
    phone: `+63 9${String(Math.floor(Math.random() * 9e8 + 1e8))}`,
    customerSince: "2024",
    totalOrders: Math.floor(Math.random() * 8) + 1,
    lifetimeValue: Math.floor(Math.random() * 40000) + 5000,
    tags: [],
    shippingAddress: "Metro Manila, Philippines",
    billingAddress: "Metro Manila, Philippines",
    paymentStatus: payStatuses[idx % 5],
    fulfillmentStatus: statuses[idx % 5],
    items: [{ id: "kb-01", name: "Sample Product", sku: "SP-01", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80", qty: 1, unitPrice: Math.floor(Math.random() * 10000) + 2000, discount: 0 }],
    shipping: 150, tax: 300, discount: 0,
    date: `May ${13 - idx}, 2025`,
    priority: "Normal",
    assignedStaff: "—",
    timeline: [{ time: "—", label: "Order Placed", by: customers[idx] ?? "Guest", type: "info" }],
    requests: [],
    aiInsights: ["Standard Order"],
  });
}

/* ──────────────────────────────────────────────
   Badge helpers
────────────────────────────────────────────── */
const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  "Paid": "bg-green-500/10 text-green-700 border-green-500/20",
  "Awaiting Payment": "bg-amber-500/10 text-amber-700 border-amber-500/25",
  "Failed": "bg-red-500/10 text-red-600 border-red-500/20",
  "Refunded": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Partially Refunded": "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const FULFILLMENT_BADGE: Record<FulfillmentStatus, string> = {
  "Pending": "bg-surface text-muted-foreground border-border",
  "Preparing": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Packed": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  "Ready to Ship": "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  "Shipped": "bg-sky-500/10 text-sky-700 border-sky-500/20",
  "Delivered": "bg-teal-500/10 text-teal-700 border-teal-500/20",
  "Completed": "bg-green-500/10 text-green-700 border-green-500/20",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  "High": "text-red-600",
  "Normal": "text-muted-foreground",
  "Low": "text-muted-foreground/50",
};

const TIMELINE_ICON: Record<TimelineEvent["type"], React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  info:    <Circle className="h-3.5 w-3.5 text-blue-500" />,
  warning: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
  system:  <Zap className="h-3.5 w-3.5 text-muted-foreground" />,
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${className}`}>
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Confirm Dialog
────────────────────────────────────────────── */
function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150" onClick={onCancel}>
      <div className="w-full max-w-sm bg-background rounded-3xl border border-hairline shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className={`h-[3px] w-full ${danger ? "bg-destructive" : "bg-accent"}`} />
        <div className="p-6 space-y-3">
          <h3 className="font-semibold text-base headline">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2.5 px-6 pb-5">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${danger ? "bg-destructive text-white hover:opacity-90" : "bg-accent text-accent-foreground hover:opacity-90"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   KPI Card
────────────────────────────────────────────── */
function KPICard({ icon, label, count, sub, accentClass, active, onClick }: {
  icon: React.ReactNode; label: string; count: number; sub: string;
  accentClass: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${active ? "border-foreground/30 bg-foreground/5 shadow-sm" : "border-hairline bg-background hover:border-border"}`}
    >
      <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl ${accentClass}`}>{icon}</div>
      <div className="headline text-2xl font-bold tabular-nums">{count}</div>
      <div className="mt-0.5 text-xs font-semibold text-foreground">{label}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>
    </button>
  );
}

/* ──────────────────────────────────────────────
   Order Detail View
────────────────────────────────────────────── */
function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>(order.fulfillmentStatus);
  const [internalNote, setInternalNote] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void } | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);

  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.qty - i.discount, 0);
  const grand = subtotal + order.shipping + order.tax - order.discount;

  function ask(title: string, message: string, confirmLabel: string, danger: boolean, fn: () => void) {
    setConfirm({ title, message, confirmLabel, danger, onConfirm: () => { fn(); setConfirm(null); } });
  }

  async function updateFulfillment(status: FulfillmentStatus) {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setFulfillmentStatus(status);
    setSaving(false);
  }

  function submitNote() {
    if (!internalNote.trim()) return;
    setInternalNote("");
    setNoteAdded(true);
    setTimeout(() => setNoteAdded(false), 2000);
  }

  const FULFILLMENT_STEPS: FulfillmentStatus[] = ["Pending", "Preparing", "Packed", "Ready to Ship", "Shipped", "Delivered", "Completed"];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}

      {/* Sub-header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="rounded-xl border border-border p-2 hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="eyebrow mb-0.5">Order Detail</div>
          <h2 className="headline text-xl font-semibold">{order.id}</h2>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Badge className={PAYMENT_BADGE[order.paymentStatus]}>{order.paymentStatus}</Badge>
          <Badge className={FULFILLMENT_BADGE[fulfillmentStatus]}>{fulfillmentStatus}</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {order.date}
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-5">

        {/* ── LEFT: Customer ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-background p-5 space-y-4">
            <div className="eyebrow">Customer</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                {order.customer.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm">{order.customer}</div>
                <div className="text-[11px] text-muted-foreground">{order.customerSince} · {order.totalOrders} orders</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />{order.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{order.phone}</div>
              <div className="flex items-center gap-2 font-semibold text-foreground"><DollarSign className="h-3.5 w-3.5 shrink-0" />${order.lifetimeValue.toLocaleString()} lifetime</div>
            </div>
            {order.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {order.tags.map(t => <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{t}</span>)}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-hairline bg-background p-5 space-y-3">
            <div className="eyebrow">Addresses</div>
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Shipping</div>
              <div className="flex items-start gap-2 text-xs text-foreground">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                {order.shippingAddress}
              </div>
            </div>
            {order.billingAddress !== order.shippingAddress && (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Billing</div>
                <div className="text-xs text-foreground">{order.billingAddress}</div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl border border-accent/15 bg-accent/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <div className="eyebrow text-accent">AI Insights</div>
            </div>
            <ul className="space-y-2">
              {order.aiInsights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent/60 shrink-0" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── CENTER: Order Summary ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-background overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline">
              <div className="eyebrow">Order Items</div>
            </div>
            <div className="divide-y divide-hairline">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover border border-hairline shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                    {item.discount > 0 && <div className="text-[10px] text-accent font-semibold mt-0.5">−${item.discount.toLocaleString()} discount</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">×{item.qty}</div>
                    <div className="font-semibold text-sm tabular-nums">${((item.unitPrice * item.qty) - item.discount).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-hairline bg-surface/40 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">${subtotal.toLocaleString()}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-accent"><span>Discount</span><span className="tabular-nums">−${order.discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="tabular-nums">{order.shipping === 0 ? "Free" : `$${order.shipping.toLocaleString()}`}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax (8%)</span><span className="tabular-nums">${order.tax.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-hairline pt-2 mt-1"><span>Total</span><span className="tabular-nums headline">${grand.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Carrier */}
          {order.carrier && (
            <div className="rounded-2xl border border-hairline bg-background px-5 py-4 flex items-center gap-4">
              <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">{order.carrier}</div>
                {order.trackingNumber
                  ? <div className="text-[11px] font-mono text-muted-foreground">{order.trackingNumber}</div>
                  : <div className="text-[11px] text-muted-foreground">Tracking not yet generated</div>
                }
              </div>
              {order.trackingNumber && (
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80 transition-opacity">
                  Track <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-2xl border border-hairline bg-background overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline">
              <div className="eyebrow">Timeline</div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {order.timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{TIMELINE_ICON[ev.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{ev.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{ev.time} · {ev.by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Requests */}
          {order.requests.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-500/15 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <div className="eyebrow text-amber-700">Customer Requests</div>
              </div>
              {order.requests.map((req, i) => (
                <div key={i} className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{req.type}</span>
                    <Badge className={req.status === "Approved" ? "bg-green-500/10 text-green-700 border-green-500/20" : req.status === "Rejected" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}>{req.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{req.reason}</p>
                  <div className="text-[10px] text-muted-foreground">{req.requestedBy} · {req.date}</div>
                  {req.status === "Pending" && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => ask("Approve Request", `Approve "${req.type}" from ${req.requestedBy}?`, "Approve", false, () => {})} className="flex-1 rounded-xl border border-green-500/30 bg-green-500/8 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-500/15 transition-colors">Approve</button>
                      <button onClick={() => ask("Reject Request", `Reject "${req.type}" from ${req.requestedBy}?`, "Reject", true, () => {})} className="flex-1 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/15 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Operations Panel ── */}
        <div className="space-y-4">
          {/* Update Fulfillment */}
          <div className="rounded-2xl border border-hairline bg-background p-5 space-y-3">
            <div className="eyebrow">Update Fulfillment</div>
            <div className="relative">
              <select
                value={fulfillmentStatus}
                onChange={(e) => {
                  const next = e.target.value as FulfillmentStatus;
                  ask("Update Fulfillment", `Change status to "${next}"? This will be recorded in the timeline.`, "Update", false, () => updateFulfillment(next));
                }}
                className="field-input appearance-none pr-8"
              >
                {FULFILLMENT_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating…
              </div>
            )}
            {/* Progress bar */}
            <div className="flex gap-1 mt-2">
              {FULFILLMENT_STEPS.map((s, idx) => (
                <div key={s} className={`flex-1 h-1 rounded-full transition-all ${idx <= FULFILLMENT_STEPS.indexOf(fulfillmentStatus) ? "bg-accent" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-hairline bg-background p-5 space-y-2">
            <div className="eyebrow mb-3">Operations</div>
            {[
              { icon: <Truck className="h-4 w-4" />,      label: "Generate Shipping Label", fn: () => ask("Generate Label", "Create a shipping label for this order?", "Generate", false, () => {}) },
              { icon: <FileText className="h-4 w-4" />,    label: "Print Invoice",          fn: () => window.print() },
              { icon: <User className="h-4 w-4" />,        label: "Assign Staff",           fn: () => ask("Assign Staff", "Reassign this order to a staff member?", "Confirm", false, () => {}) },
              { icon: <Mail className="h-4 w-4" />,        label: "Contact Customer",       fn: () => window.open(`mailto:${order.email}`) },
              { icon: <RotateCcw className="h-4 w-4" />,   label: "Process Refund",         fn: () => ask("Process Refund", `Refund $${grand.toLocaleString()} to ${order.customer}?`, "Refund", true, () => {}) },
              { icon: <Ban className="h-4 w-4" />,         label: "Cancel Order",           fn: () => ask("Cancel Order", `Cancel ${order.id}? This will release reserved inventory.`, "Cancel Order", true, () => {}) },
            ].map(({ icon, label, fn }) => (
              <button key={label} onClick={fn} className="flex items-center gap-3 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors text-left group">
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Internal Note */}
          <div className="rounded-2xl border border-hairline bg-background p-5 space-y-3">
            <div className="eyebrow">Internal Note</div>
            <textarea
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
              rows={3}
              placeholder="Add a private note for your team…"
              className="field-input resize-none text-xs"
            />
            <button
              onClick={submitNote}
              disabled={!internalNote.trim()}
              className="flex items-center gap-2 w-full justify-center rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {noteAdded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              {noteAdded ? "Note Added!" : "Add Note"}
            </button>
          </div>

          {/* Assigned staff */}
          <div className="rounded-2xl border border-hairline bg-background px-5 py-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              {order.assignedStaff === "—" ? "?" : order.assignedStaff.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Assigned Staff</div>
              <div className="text-sm font-medium text-foreground">{order.assignedStaff}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Orders Page
────────────────────────────────────────────── */
function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [activeKPI, setActiveKPI] = useState<string | null>(null);
  const [payFilter, setPayFilter] = useState<string>("All");
  const [fulfillFilter, setFulfillFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  if (selectedOrder) return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;

  const KPI_DEFS = [
    { key: "pending",   label: "Pending",          icon: <Circle className="h-4 w-4 text-amber-600" />,        count: MOCK_ORDERS.filter(o => o.fulfillmentStatus === "Pending").length,           sub: "Awaiting action",          accent: "bg-amber-500/10 text-amber-600",  match: (o: Order) => o.fulfillmentStatus === "Pending" },
    { key: "preparing", label: "Preparing",         icon: <Package className="h-4 w-4 text-blue-600" />,        count: MOCK_ORDERS.filter(o => o.fulfillmentStatus === "Preparing").length,         sub: "In progress",              accent: "bg-blue-500/10 text-blue-600",    match: (o: Order) => o.fulfillmentStatus === "Preparing" },
    { key: "ready",     label: "Ready to Ship",     icon: <Truck className="h-4 w-4 text-indigo-600" />,        count: MOCK_ORDERS.filter(o => o.fulfillmentStatus === "Ready to Ship").length,    sub: "Awaiting pickup",          accent: "bg-indigo-500/10 text-indigo-600",match: (o: Order) => o.fulfillmentStatus === "Ready to Ship" },
    { key: "shipped",   label: "Shipped Today",     icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,  count: MOCK_ORDERS.filter(o => o.fulfillmentStatus === "Shipped").length,           sub: "In transit",               accent: "bg-green-500/10 text-green-600",  match: (o: Order) => o.fulfillmentStatus === "Shipped" },
    { key: "refund",    label: "Refund Requests",   icon: <RotateCcw className="h-4 w-4 text-red-500" />,       count: MOCK_ORDERS.filter(o => o.requests.some(r => r.status === "Pending")).length, sub: "Needs review",            accent: "bg-red-500/10 text-red-500",      match: (o: Order) => o.requests.some(r => r.status === "Pending") },
    { key: "awaiting",  label: "Awaiting Payment",  icon: <AlertCircle className="h-4 w-4 text-orange-500" />,  count: MOCK_ORDERS.filter(o => o.paymentStatus === "Awaiting Payment").length,     sub: "Follow-up needed",         accent: "bg-orange-500/10 text-orange-500",match: (o: Order) => o.paymentStatus === "Awaiting Payment" },
  ];

  const activeKPIDef = KPI_DEFS.find(k => k.key === activeKPI);

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter(o => {
      const s = search.toLowerCase();
      const matchSearch = !s ||
        o.id.toLowerCase().includes(s) ||
        o.customer.toLowerCase().includes(s) ||
        o.email.toLowerCase().includes(s);
      const matchKPI = !activeKPIDef || activeKPIDef.match(o);
      const matchPay = payFilter === "All" || o.paymentStatus === payFilter;
      const matchFulfill = fulfillFilter === "All" || o.fulfillmentStatus === fulfillFilter;
      return matchSearch && matchKPI && matchPay && matchFulfill;
    });
  }, [search, activeKPI, payFilter, fulfillFilter, activeKPIDef]);

  const hasActiveFilters = activeKPI || payFilter !== "All" || fulfillFilter !== "All" || search;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-1.5">Commerce</div>
          <h1 className="headline text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Manage fulfillment, payments, shipping, and post-purchase operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-3.5 py-2 text-xs font-semibold hover:opacity-90 transition-all shadow-sm">
            <Plus className="h-3.5 w-3.5" /> Create Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_DEFS.map(k => (
          <KPICard
            key={k.key}
            icon={k.icon}
            label={k.label}
            count={k.count}
            sub={k.sub}
            accentClass={k.accent}
            active={activeKPI === k.key}
            onClick={() => setActiveKPI(prev => prev === k.key ? null : k.key)}
          />
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, customer, email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors ${showFilters ? "border-foreground/40 bg-foreground/5" : "border-border hover:bg-muted/50"}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          {(payFilter !== "All" || fulfillFilter !== "All") && (
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-hairline bg-surface/40 p-4 animate-in slide-in-from-top-2 duration-200">
          {[
            { label: "Payment Status", value: payFilter, setter: setPayFilter, options: ["All", "Paid", "Awaiting Payment", "Failed", "Refunded", "Partially Refunded"] },
            { label: "Fulfillment Status", value: fulfillFilter, setter: setFulfillFilter, options: ["All", "Pending", "Preparing", "Packed", "Ready to Ship", "Shipped", "Delivered", "Completed"] },
          ].map(({ label, value, setter, options }) => (
            <div key={label} className="space-y-1">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
              <div className="relative">
                <select value={value} onChange={e => setter(e.target.value)} className="pl-3 pr-7 py-2 text-xs font-semibold bg-background border border-border rounded-lg appearance-none cursor-pointer focus:outline-none">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          {activeKPI && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
              {KPI_DEFS.find(k => k.key === activeKPI)?.label}
              <button onClick={() => setActiveKPI(null)} className="hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {payFilter !== "All" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
              {payFilter}
              <button onClick={() => setPayFilter("All")} className="hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          {fulfillFilter !== "All" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
              {fulfillFilter}
              <button onClick={() => setFulfillFilter("All")} className="hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
            </span>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> of {MOCK_ORDERS.length} orders
          </p>
          {hasActiveFilters && (
            <button onClick={() => { setSearch(""); setActiveKPI(null); setPayFilter("All"); setFulfillFilter("All"); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
          )}
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl border border-hairline overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface/50">
                {["Order", "Customer", "Payment", "Fulfillment", "Items", "Total", "Date", "Priority", "Staff", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-muted-foreground">No orders match your filters.</td></tr>
              ) : filtered.map(order => {
                const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
                const grand = order.items.reduce((s, i) => s + i.unitPrice * i.qty - i.discount, 0) + order.shipping + order.tax - order.discount;
                return (
                  <tr
                    key={order.id}
                    className="group hover:bg-muted/15 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-sm text-foreground font-mono">{order.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground text-sm">{order.customer}</div>
                      <div className="text-[11px] text-muted-foreground">{order.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={PAYMENT_BADGE[order.paymentStatus]}>{order.paymentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={FULFILLMENT_BADGE[order.fulfillmentStatus]}>{order.fulfillmentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-sm">${grand.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${PRIORITY_BADGE[order.priority]}`}>{order.priority}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{order.assignedStaff}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold hover:bg-muted/60 transition-colors"
                        >
                          View <ArrowUpRight className="h-3 w-3" />
                        </button>
                        <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="border-t border-hairline px-5 py-3 flex items-center justify-between bg-surface/30">
          <p className="text-xs text-muted-foreground">{filtered.length} orders</p>
          <p className="text-xs text-muted-foreground">Mock data — connect to Supabase orders table to go live</p>
        </div>
      </div>
    </div>
  );
}
