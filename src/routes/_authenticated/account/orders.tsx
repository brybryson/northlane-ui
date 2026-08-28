import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  PackageCheck,
  Circle,
  ImagePlus,
  X,
  ThumbsUp,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import productKeyboard from "@/assets/product-keyboard.jpg";
import productMouse from "@/assets/product-mouse.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLamp from "@/assets/product-lamp.jpg";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({
    meta: [
      { title: "Orders & Package Tracking — Northlane Studio" },
      {
        name: "description",
        content: "Track your orders, rate products, and review your purchase history.",
      },
    ],
  }),
  component: OrdersPage,
});

type OrderStatus = "Placed" | "Processing" | "To Receive" | "To Rate" | "Completed";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  sku: string;
  productId: string;
  reviewTitle?: string;
  reviewComment?: string;
  reviewRating?: number;
  reviewMedia?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: OrderItem[];
  shippingAddress: string;
  timelineStep: number;
}

const LIFECYCLE_STEPS: { step: number; label: string }[] = [
  { step: 1, label: "Placed" },
  { step: 2, label: "Processing" },
  { step: 3, label: "To Receive" },
  { step: 4, label: "To Rate" },
  { step: 5, label: "Completed" },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { icon: React.FC<any>; cls: string }> = {
    Placed: { icon: Circle, cls: "bg-surface text-muted-foreground border-hairline" },
    Processing: { icon: Package, cls: "bg-accent/10 text-accent border-accent/20" },
    "To Receive": { icon: Truck, cls: "bg-foreground/8 text-foreground border-foreground/15" },
    "To Rate": { icon: Star, cls: "bg-accent/10 text-accent border-accent/20" },
    Completed: { icon: CheckCircle2, cls: "bg-surface text-foreground border-hairline" },
  };
  const { icon: Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "NL-89210",
    date: "Aug 01, 2026",
    total: 485,
    status: "To Receive",
    carrier: "DHL Express",
    trackingNumber: "DHL-9842109482",
    estimatedDelivery: "Aug 06, 2026",
    shippingAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
    timelineStep: 3,
    items: [
      { id: "prod-kb-85", productId: "kb-01", name: "Ergonomic Low-Profile Mechanical Keyboard", price: 210, qty: 1, image: productKeyboard, sku: "NL-KB-85" },
      { id: "prod-mat-oak", productId: "m-01", name: "Northlane Solid Oak Wool Desk Mat", price: 85, qty: 1, image: productMouse, sku: "NL-MAT-OAK" },
      { id: "prod-lamp-brass", productId: "a-01", name: "Minimalist Brass Desk Task Lamp", price: 140, qty: 1, image: productLamp, sku: "NL-LMP-BR" },
      { id: "prod-mouse-precision", productId: "m-02", name: "Precision Ergonomic Wireless Mouse", price: 115, qty: 1, image: productMouse, sku: "NL-MS-PRO" },
    ],
  },
  {
    id: "NL-85001",
    date: "Jul 18, 2026",
    total: 8400,
    status: "Completed",
    carrier: "FedEx Priority",
    trackingNumber: "FDX-5514002190",
    estimatedDelivery: "Jul 22, 2026",
    shippingAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
    timelineStep: 5,
    items: [
      {
        id: "prod-flow75",
        productId: "kb-02",
        name: "Northlane Flow 75 Pro Keyboard",
        price: 5450,
        qty: 1,
        image: productKeyboard,
        sku: "NL-KB-F75",
        reviewRating: 5,
        reviewTitle: "Best keyboard I've ever owned, period.",
        reviewComment: "I've tried dozens of keyboards over the years — the Northlane Flow 75 Pro is on another level. The low-profile linears are buttery smooth with zero wobble.",
      },
      {
        id: "prod-nordic-mouse",
        productId: "m-01",
        name: "Nordic Wireless Precision Mouse",
        price: 2950,
        qty: 1,
        image: productMouse,
        sku: "NL-MS-NRD",
        reviewRating: 4,
        reviewTitle: "Quiet, precise, and surprisingly light.",
        reviewComment: "Switched from a basic office mouse and the difference is night and day. Silent clicks are fantastic for open-plan offices.",
      },
    ],
  },
];

// ─── Per-Item Review State ────────────────────────────────────────────────────
interface ItemReview {
  rating: number;
  title: string;
  comment: string;
  photoPreview: string;
  photoDataUrl: string;
  photoCaption: string;
}

function emptyReview(): ItemReview {
  return { rating: 0, title: "", comment: "", photoPreview: "", photoDataUrl: "", photoCaption: "" };
}

// ─── Optimize & validate image via Canvas ────────────────────────────────────
function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// ─── View Review Modal ────────────────────────────────────────────────────────
interface ViewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
}

function ViewReviewModal({ isOpen, onClose, item }: ViewReviewModalProps) {
  if (!item) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 border-hairline bg-background shadow-2xl overflow-hidden z-[100]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-foreground/20 to-accent rounded-t-3xl" />
        <DialogHeader className="px-6 pt-7 pb-5 border-b border-hairline text-left sm:text-left">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-0.5">Your Review</div>
              <DialogTitle className="text-base font-bold tracking-tight text-foreground leading-tight">
                {item.name}
              </DialogTitle>
            </div>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= (item.reviewRating ?? 0) ? "fill-foreground text-foreground" : "text-muted-foreground/20"}`} />
            ))}
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3">
          {item.reviewTitle && (
            <p className="text-sm font-bold text-foreground">{item.reviewTitle}</p>
          )}
          {item.reviewComment && (
            <p className="text-sm text-muted-foreground leading-relaxed">{item.reviewComment}</p>
          )}
          {item.reviewMedia && (
            <img src={item.reviewMedia} alt="Review photo" className="w-full rounded-xl border border-hairline object-cover max-h-48" />
          )}
          <Link
            to="/products/$productId"
            params={{ productId: item.productId }}
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline mt-1"
          >
            View on product page →
          </Link>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rate Order Modal ─────────────────────────────────────────────────────────
interface RateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmitted: (orderId: string, reviews: Record<string, ItemReview>) => void;
}

function RateOrderModal({ isOpen, onClose, order, onSubmitted }: RateOrderModalProps) {
  const [reviews, setReviews] = useState<Record<string, ItemReview>>({});
  const [hoveredStar, setHoveredStar] = useState<Record<string, number>>({});
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Reset state whenever the target order changes
  useEffect(() => {
    setReviews({});
    setHoveredStar({});
    setActiveItemIdx(0);
  }, [order?.id]);

  if (!order) return null;

  const items = order.items;
  const rev = reviews[items[activeItemIdx]?.id] ?? emptyReview();
  const allRated = items.every((it) => (reviews[it.id]?.rating ?? 0) > 0);

  const updateRev = (itemId: string, patch: Partial<ItemReview>) =>
    setReviews((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? emptyReview()), ...patch } }));

  const handleFileChange = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Strict PNG / JPEG only
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Only PNG and JPEG images are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be under 10 MB.");
      e.target.value = "";
      return;
    }
    try {
      const optimized = await optimizeImage(file);
      updateRev(itemId, { photoPreview: optimized, photoDataUrl: optimized });
    } catch {
      toast.error("Could not process image. Please try another file.");
    }
  };

  const handleSubmit = async () => {
    if (!allRated) { toast.error("Please rate all items before submitting."); return; }
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      for (const item of items) {
        const r = reviews[item.id];
        if (!r?.rating) continue;
        const payload: any = {
          order_id: order.id,
          product_id: item.productId,
          rating: r.rating,
          title: r.title || item.name,
          comment: r.comment || "",
          media_url: r.photoDataUrl || "",
          media_caption: r.photoCaption || "",
          verified: true,
        };
        if (userId) payload.user_id = userId;
        await (supabase as any).from("order_reviews").insert(payload);
      }
      toast.success("Reviews submitted! Your order is now complete.");
      onSubmitted(order.id, reviews);
      onClose();
    } catch {
      toast.error("Failed to submit reviews. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const STAR_LABELS: Record<number, string> = {
    1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent",
  };

  return (
    // No DialogOverlay dark bg — use transparent AnimatePresence instead
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Subtle backdrop — no dark overlay */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[88vh] bg-background border border-hairline rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Top accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-foreground/20 to-accent" />

            {/* Header */}
            <div className="px-6 pt-7 pb-5 border-b border-hairline shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent mb-0.5">
                      {order.id}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      Rate Your Purchase
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Share your experience with each item to help the community and complete your order.
              </p>
            </div>

            {/* Scrollable item cards */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-3">
              {items.map((item, idx) => {
                const r = reviews[item.id] ?? emptyReview();
                const isActive = idx === activeItemIdx;
                const isRated = r.rating > 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all ${
                      isActive
                        ? "border-foreground/30 bg-surface/60 shadow-xs"
                        : "border-hairline bg-surface/20 hover:bg-surface/40 cursor-pointer"
                    }`}
                    onClick={() => !isActive && setActiveItemIdx(idx)}
                  >
                    {/* Item header row */}
                    <div className="flex items-center gap-3.5 p-4">
                      <div className="relative shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-11 w-11 rounded-xl object-cover border border-hairline"
                        />
                        {isRated && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-foreground flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-background" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">SKU: {item.sku}</p>
                      </div>
                      {!isActive && r.rating > 0 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-foreground text-foreground" : "text-hairline"}`} />
                          ))}
                        </div>
                      )}
                      {!isActive && !r.rating && (
                        <span className="text-[10px] font-semibold text-muted-foreground shrink-0">Tap to rate</span>
                      )}
                    </div>

                    {/* Expanded form */}
                    {isActive && (
                      <div className="px-4 pb-4 space-y-4 border-t border-hairline/60 pt-4">
                        {/* Stars */}
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground block mb-2">Your Rating</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = star <= ((hoveredStar[item.id] ?? 0) || r.rating);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoveredStar((p) => ({ ...p, [item.id]: star }))}
                                  onMouseLeave={() => setHoveredStar((p) => ({ ...p, [item.id]: 0 }))}
                                  onClick={() => updateRev(item.id, { rating: star })}
                                  className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Star className={`h-7 w-7 transition-colors ${active ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`} />
                                </button>
                              );
                            })}
                            {r.rating > 0 && (
                              <span className="ml-1 text-xs font-semibold text-muted-foreground">{STAR_LABELS[r.rating]}</span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground block mb-1.5">Review Title</label>
                          <input
                            type="text"
                            placeholder="Summarize your experience…"
                            value={r.title}
                            onChange={(e) => updateRev(item.id, { title: e.target.value })}
                            className="w-full rounded-xl border border-hairline bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground block mb-1.5">Your Review</label>
                          <textarea
                            placeholder="Tell others what you think about this product…"
                            value={r.comment}
                            onChange={(e) => updateRev(item.id, { comment: e.target.value })}
                            rows={3}
                            className="w-full rounded-xl border border-hairline bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                          />
                        </div>

                        {/* Photo upload — PNG/JPEG only, auto-optimized */}
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground block mb-1.5">
                            Photo <span className="normal-case tracking-normal font-normal">(optional · PNG or JPEG only)</span>
                          </label>
                          <input
                            ref={(el) => { fileInputRefs.current[item.id] = el; }}
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleFileChange(item.id, e)}
                          />
                          {r.photoPreview ? (
                            <div className="space-y-2">
                              <div className="relative inline-block">
                                <img
                                  src={r.photoPreview}
                                  alt="Preview"
                                  className="h-28 w-auto max-w-full rounded-xl border border-hairline object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateRev(item.id, { photoPreview: "", photoDataUrl: "", photoCaption: "" })}
                                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground text-background flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Add a caption…"
                                value={r.photoCaption}
                                onChange={(e) => updateRev(item.id, { photoCaption: e.target.value })}
                                className="w-full rounded-xl border border-hairline bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[item.id]?.click()}
                              className="group w-full flex items-center gap-3 rounded-2xl border border-dashed border-hairline bg-surface/40 p-3.5 transition-all hover:bg-surface/80 hover:border-foreground/30 cursor-pointer"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-hairline/30 text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
                                <ImagePlus className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-foreground">Upload a photo</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">PNG or JPEG · auto-optimized · max 10 MB</p>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Next item shortcut */}
                        {idx < items.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveItemIdx(idx + 1)}
                            className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-right cursor-pointer"
                          >
                            Next item →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-hairline shrink-0 flex flex-col gap-2 bg-background">
              <button
                onClick={handleSubmit}
                disabled={!allRated || submitting}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  allRated && !submitting
                    ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                    : "bg-surface text-muted-foreground border border-hairline cursor-not-allowed opacity-60"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit All Reviews"}
              </button>
              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center rounded-full border border-hairline bg-surface/50 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({
    "NL-89210": true,
    "NL-85001": true,
  });
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [viewReviewItem, setViewReviewItem] = useState<OrderItem | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        let dbOrders: Order[] = [];
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id;

        if (userId) {
          const { data: ordersData, error } = await (supabase as any)
            .from("orders")
            .select(`
              id,
              created_at,
              total,
              status,
              carrier,
              tracking_number,
              estimated_delivery,
              shipping_address,
              timeline_step,
              order_items (
                id,
                product_id,
                product_name,
                product_image,
                sku,
                price,
                quantity
              )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (!error && ordersData && mounted) {
            dbOrders = ordersData.map((o: any) => ({
              id: o.id,
              date: new Date(o.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
              total: Number(o.total),
              status: (o.status || "Placed") as OrderStatus,
              carrier: o.carrier || "DHL Express",
              trackingNumber: o.tracking_number || "DHL-9842109482",
              estimatedDelivery: o.estimated_delivery || "3-5 Business Days",
              shippingAddress: o.shipping_address || "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
              timelineStep: o.timeline_step || 1,
              items: (o.order_items || []).map((it: any) => ({
                id: it.id,
                productId: it.product_id,
                name: it.product_name,
                price: Number(it.price),
                qty: it.quantity,
                image: it.product_image || productKeyboard,
                sku: it.sku || `NL-${it.product_id?.toUpperCase()}`,
              })),
            }));
          }
        }

        // Local stored orders
        let localOrders: Order[] = [];
        try {
          const stored = localStorage.getItem("northlane_user_orders");
          if (stored) {
            localOrders = JSON.parse(stored);
          }
        } catch {}

        if (!mounted) return;

        // Merge: dbOrders + localOrders (deduplicated by ID) + INITIAL_ORDERS
        const orderMap = new Map<string, Order>();
        dbOrders.forEach((o) => orderMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        INITIAL_ORDERS.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });

        const mergedOrders = Array.from(orderMap.values());
        setOrders(mergedOrders);

        // Auto-expand all orders
        setExpandedOrders((prev) => {
          const updated = { ...prev };
          mergedOrders.forEach((o) => {
            if (updated[o.id] === undefined) updated[o.id] = true;
          });
          return updated;
        });
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    };

    loadOrders();

    const handleOrderCreated = () => {
      loadOrders();
    };

    window.addEventListener("northlane_order_created", handleOrderCreated);

    return () => {
      mounted = false;
      window.removeEventListener("northlane_order_created", handleOrderCreated);
    };
  }, []);

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    toast.success("Tracking number copied!");
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const toggleOrderExpanded = (orderId: string) =>
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const toggleItemsExpanded = (orderId: string) =>
    setExpandedItems((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const openRateModal = (order: Order) => {
    setRatingOrder(order);
    setRateModalOpen(true);
  };

  const handleReviewSubmitted = (orderId: string, submittedReviews: Record<string, ItemReview>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "Completed",
          timelineStep: 5,
          items: o.items.map((item) => {
            const r = submittedReviews[item.id];
            if (!r) return item;
            return {
              ...item,
              reviewRating: r.rating,
              reviewTitle: r.title,
              reviewComment: r.comment,
              reviewMedia: r.photoDataUrl || undefined,
            };
          }),
        };
      }),
    );
  };

  const FILTER_TABS: ("All" | OrderStatus)[] = [
    "All", "Processing", "To Receive", "To Rate", "Completed",
  ];

  const filteredOrders = orders.filter(
    (o) => statusFilter === "All" || o.status === statusFilter,
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

      {/* Page Header */}
      <div>
        <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Order History
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          My Orders
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Track shipments, rate products, and review your full purchase history.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-hairline overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
          {FILTER_TABS.map((tab) => {
            const count = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`relative pb-3 px-4 sm:px-5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-foreground text-background" : "bg-surface text-muted-foreground border border-hairline"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-background border border-hairline space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface text-muted-foreground mx-auto flex items-center justify-center border border-hairline">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">No Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">No orders with the status "{statusFilter}" yet.</p>
          <button
            onClick={() => setStatusFilter("All")}
            className="mt-2 px-5 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          >
            View All Orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id] ?? true;
            const isItemsExpanded = expandedItems[order.id] ?? false;
            const visibleItems = isItemsExpanded ? order.items : order.items.slice(0, 3);
            const hiddenCount = order.items.length - 3;

            return (
              <div key={order.id} className="rounded-2xl bg-background border border-hairline overflow-hidden shadow-xs transition-all hover:border-foreground/20">
                {/* Top Bar */}
                <div className="p-4 sm:p-5 bg-surface/40 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Order ID</span>
                      <span className="text-sm font-bold tracking-tight text-foreground">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Date</span>
                      <span className="text-xs text-foreground font-semibold">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block">Total</span>
                      <span className="text-xs font-bold text-foreground">${order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
                    <StatusBadge status={order.status} />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.success(`Invoice downloaded for ${order.id}`)}
                        className="p-1.5 rounded-full bg-background hover:bg-surface text-foreground transition-colors border border-hairline cursor-pointer"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleOrderExpanded(order.id)}
                        className="px-3 py-1.5 rounded-full bg-background hover:bg-surface text-foreground text-xs font-semibold transition-colors border border-hairline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "Collapse" : "Details"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      {/* Timeline */}
                      <div className="p-4 sm:p-5 bg-background border-b border-hairline space-y-4">
                        {order.carrier && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-accent shrink-0" />
                              <span className="text-xs font-semibold text-foreground">
                                {order.carrier} — <span className="text-accent font-bold">{order.trackingNumber}</span>
                              </span>
                              <button
                                onClick={() => handleCopyTracking(order.trackingNumber)}
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              >
                                {copiedTracking === order.trackingNumber
                                  ? <Check className="w-3.5 h-3.5 text-foreground" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {order.status === "Completed" ? "Delivered:" : "Est. Delivery:"}{" "}
                              <strong className="text-foreground font-semibold">{order.estimatedDelivery}</strong>
                            </span>
                          </div>
                        )}

                        {/* 5-step progress */}
                        <div className="space-y-2.5 pt-1">
                          <div className="overflow-hidden h-1 flex rounded-full bg-surface border border-hairline">
                            <div
                              style={{ width: `${((order.timelineStep - 1) / 4) * 100}%` }}
                              className="bg-foreground transition-all duration-700 rounded-full"
                            />
                          </div>
                          <div className="grid grid-cols-5 text-center gap-1">
                            {LIFECYCLE_STEPS.map((s) => (
                              <span key={s.step} className={`text-[10px] leading-tight font-medium transition-colors ${
                                order.timelineStep >= s.step ? "text-foreground font-bold" : "text-muted-foreground/40"
                              }`}>
                                {s.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          Items ({order.items.length})
                        </h4>

                        <div className="space-y-2">
                          {visibleItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3.5 rounded-xl bg-surface/50 border border-hairline hover:border-foreground/20 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover border border-hairline shrink-0" />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold tracking-tight text-foreground truncate">{item.name}</h5>
                                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-semibold">SKU: {item.sku} · Qty: {item.qty}</span>

                                  {/* Completed: show review badge + View button */}
                                  {order.status === "Completed" && item.reviewRating && (
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-foreground bg-surface border border-hairline rounded-full px-2 py-0.5">
                                        <PackageCheck className="h-2.5 w-2.5" />
                                        Reviewed
                                      </span>
                                      {/* Mini star display */}
                                      <span className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map((s) => (
                                          <Star key={s} className={`h-2.5 w-2.5 ${s <= item.reviewRating! ? "fill-foreground text-foreground" : "text-hairline"}`} />
                                        ))}
                                      </span>
                                      <button
                                        onClick={() => setViewReviewItem(item)}
                                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-accent hover:underline cursor-pointer"
                                      >
                                        <Eye className="h-2.5 w-2.5" />
                                        View Review
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-foreground">${(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Show More */}
                        {hiddenCount > 0 && (
                          <div className="pt-1 text-center">
                            <button
                              onClick={() => toggleItemsExpanded(order.id)}
                              className="px-4 py-2 rounded-full bg-surface hover:bg-muted/60 text-foreground text-xs font-semibold border border-hairline transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{isItemsExpanded ? "Show Less" : `+ ${hiddenCount} More Items`}</span>
                              {isItemsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* To Rate CTA */}
                        {order.status === "To Rate" && (
                          <div className="mt-1 pt-3 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-foreground">Your order has been delivered!</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Share your feedback to help the community and complete your order.</p>
                            </div>
                            <button
                              onClick={() => openRateModal(order)}
                              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground hover:opacity-90 text-background text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Rate Now
                            </button>
                          </div>
                        )}

                        {/* Completed summary */}
                        {order.status === "Completed" && (
                          <div className="mt-1 pt-3 border-t border-hairline flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                              <p className="text-xs font-semibold text-foreground">Order complete — all items reviewed.</p>
                            </div>
                            <Link
                              to="/shop"
                              className="shrink-0 text-xs font-semibold text-accent hover:underline cursor-pointer"
                            >
                              Shop Again →
                            </Link>
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

      {/* Rate Order Modal */}
      <RateOrderModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        order={ratingOrder}
        onSubmitted={handleReviewSubmitted}
      />

      {/* View Review Modal */}
      <ViewReviewModal
        isOpen={!!viewReviewItem}
        onClose={() => setViewReviewItem(null)}
        item={viewReviewItem}
      />
    </div>
  );
}
