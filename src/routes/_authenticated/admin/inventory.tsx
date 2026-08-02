import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listProducts, recordStockAdjustment } from "@/lib/cms.functions";
import {
  AlertTriangle, Package, TrendingDown, CheckCircle,
  SlidersHorizontal, Loader2, ArrowUpDown, X, ChevronDown,
  Plus, Minus, ClipboardList, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  component: InventoryPage,
});

type StockProduct = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  stock_count: number;
  in_stock: boolean;
  price: number;
};

const LOW_STOCK = 5;
const CRITICAL_STOCK = 2;

const CATEGORIES = [
  "All",
  "Keyboards", "Mouse", "Audio", "Monitors", "Desks",
  "Seating", "Desk Accessories", "Creator Gear", "Smart Office", "Power",
];

const ADJUSTMENT_TYPES = [
  { value: "received",    label: "Received (Stock In)",   sign: 1  },
  { value: "returned",    label: "Customer Return",        sign: 1  },
  { value: "damaged",     label: "Damaged / Defective",   sign: -1 },
  { value: "correction",  label: "Stock Correction",      sign: 0  },
  { value: "written_off", label: "Written Off / Expired", sign: -1 },
  { value: "reserved",    label: "Reserved / Set Aside",  sign: -1 },
] as const;

type AdjustmentType = typeof ADJUSTMENT_TYPES[number]["value"];

function stockStatus(count: number) {
  if (count === 0)        return { label: "Out of Stock", color: "text-red-600",    bg: "bg-red-500/10 border-red-500/20",     dot: "bg-red-500"   };
  if (count <= CRITICAL_STOCK) return { label: "Critical",     color: "text-red-500",    bg: "bg-red-500/10 border-red-500/20",     dot: "bg-red-500"   };
  if (count <= LOW_STOCK) return { label: "Low Stock",   color: "text-amber-600",  bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" };
  return                         { label: "In Stock",    color: "text-green-700",  bg: "bg-green-500/10 border-green-500/15", dot: "bg-green-500" };
}

function StockBar({ count, max = 60 }: { count: number; max?: number }) {
  const pct = Math.min((count / max) * 100, 100);
  const color =
    count === 0 ? "bg-red-400"
    : count <= CRITICAL_STOCK ? "bg-red-400"
    : count <= LOW_STOCK ? "bg-amber-400"
    : "bg-green-400";
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Redesigned Adjust Stock Modal ─── */
function AdjustStockModal({
  product,
  onClose,
  onAdjust,
}: {
  product: StockProduct;
  onClose: () => void;
  onAdjust: (
    productId: string,
    adjustmentType: AdjustmentType,
    quantityChange: number,
    quantityBefore: number,
    notes?: string,
    reference?: string
  ) => Promise<void>;
}) {
  const [adjType, setAdjType] = useState<AdjustmentType>("received");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const selectedType = ADJUSTMENT_TYPES.find((t) => t.value === adjType)!;
  const isCorrection = adjType === "correction";
  const effectiveChange = isCorrection ? qty : selectedType.sign * Math.abs(qty);
  const newStock = Math.max(0, product.stock_count + effectiveChange);
  const isInvalid = qty === 0 || (!isCorrection && newStock === product.stock_count);

  async function handleConfirm() {
    setSaving(true);
    try {
      await onAdjust(
        product.id,
        adjType,
        effectiveChange,
        product.stock_count,
        notes.trim() || undefined,
        reference.trim() || undefined
      );
      onClose();
    } catch {
      // error toasted by caller
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background rounded-3xl border border-hairline shadow-[0_32px_64px_rgba(0,0,0,0.12)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber top accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-accent/50 via-accent to-accent/50" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3.5">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt=""
                className="h-12 w-12 rounded-2xl object-cover border border-hairline shrink-0 shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-accent/8 border border-accent/15 shrink-0 flex items-center justify-center">
                <Package className="h-5 w-5 text-accent" />
              </div>
            )}
            <div>
              <div className="eyebrow mb-0.5">Stock Adjustment</div>
              <h3 className="headline text-base font-semibold leading-tight">{product.name}</h3>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-5 space-y-4">

          {/* Stock Preview Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4 gap-2">
            <div className="text-center flex-1">
              <p className="eyebrow mb-1.5">Current</p>
              <p className="text-3xl font-bold tabular-nums headline">{product.stock_count}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2">
              <ArrowRight className={`h-5 w-5 mb-1 ${effectiveChange > 0 ? "text-accent" : effectiveChange < 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`text-xs font-bold tabular-nums ${effectiveChange > 0 ? "text-accent" : effectiveChange < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {effectiveChange > 0 ? `+${effectiveChange}` : effectiveChange || "—"}
              </span>
            </div>
            <div className="text-center flex-1">
              <p className="eyebrow mb-1.5">New Stock</p>
              <p className={`text-3xl font-bold tabular-nums headline ${
                newStock > product.stock_count ? "text-accent"
                : newStock < product.stock_count ? "text-destructive"
                : "text-foreground"
              }`}>
                {newStock}
              </p>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Adjustment Type</label>
            <div className="relative">
              <select
                value={adjType}
                onChange={(e) => { setAdjType(e.target.value as AdjustmentType); setQty(1); }}
                className="field-input appearance-none pr-8"
              >
                {ADJUSTMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
              {isCorrection ? "Quantity Change (negative to remove)" : "Quantity"}
            </label>
            <div className="flex items-center gap-2">
              {!isCorrection && (
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border shrink-0 ${
                  selectedType.sign >= 0
                    ? "bg-accent/10 border-accent/20 text-accent"
                    : "bg-destructive/8 border-destructive/20 text-destructive"
                }`}>
                  {selectedType.sign >= 0 ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </span>
              )}
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 0)}
                min={isCorrection ? undefined : 1}
                className="field-input flex-1 tabular-nums text-center text-lg font-semibold"
                placeholder={isCorrection ? "e.g. −5 or +10" : "Enter quantity"}
              />
            </div>
            {!isCorrection && newStock === 0 && qty > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium">
                  This will mark the product as out-of-stock.
                </p>
              </div>
            )}
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
              Reference / PO# <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PO-2026-001 or Supplier invoice #"
              className="field-input"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
              Notes <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional context for this adjustment..."
              className="field-input resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-hairline bg-surface/60 px-6 py-4">
          {!confirming ? (
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isInvalid}
                onClick={() => setConfirming(true)}
                className="flex-1 rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Review Adjustment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-accent/20 bg-accent/6 px-4 py-3.5">
                <p className="text-sm font-semibold text-foreground">Confirm this adjustment?</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  <span className="font-semibold text-foreground">{selectedType.label}</span>
                  {" "}· Stock changes from{" "}
                  <span className="font-bold tabular-nums text-foreground">{product.stock_count}</span>
                  {" → "}
                  <span className={`font-bold tabular-nums ${newStock > product.stock_count ? "text-accent" : "text-destructive"}`}>{newStock}</span>
                  {" "}({effectiveChange > 0 ? "+" : ""}{effectiveChange} units). This will be saved to the audit log.
                </p>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                  {saving ? "Saving…" : "Confirm & Record"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Inventory Page ─── */
function InventoryPage() {
  const qc = useQueryClient();
  const getProducts = useServerFn(listProducts);
  const doAdjust = useServerFn(recordStockAdjustment);

  const [sortBy, setSortBy] = useState<"stock_asc" | "stock_desc" | "name">("stock_asc");
  const [filterCategory, setFilterCategory] = useState("All");
  const [adjustProduct, setAdjustProduct] = useState<StockProduct | null>(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => getProducts({}),
  });

  const allProducts = (raw as StockProduct[] | undefined) ?? [];

  const products = allProducts
    .filter((p) => filterCategory === "All" || p.category === filterCategory)
    .slice()
    .sort((a, b) => {
      if (sortBy === "stock_asc") return a.stock_count - b.stock_count;
      if (sortBy === "stock_desc") return b.stock_count - a.stock_count;
      return a.name.localeCompare(b.name);
    });

  const outOfStock = allProducts.filter((p) => p.stock_count === 0).length;
  const lowStock   = allProducts.filter((p) => p.stock_count > 0 && p.stock_count <= LOW_STOCK).length;
  const healthy    = allProducts.filter((p) => p.stock_count > LOW_STOCK).length;

  async function handleAdjust(
    productId: string,
    adjustmentType: AdjustmentType,
    quantityChange: number,
    quantityBefore: number,
    notes?: string,
    reference?: string
  ) {
    try {
      await doAdjust({
        data: { product_id: productId, adjustment_type: adjustmentType, quantity_change: quantityChange, quantity_before: quantityBefore, notes, reference },
      });
      toast.success(`Stock adjusted — ${quantityChange > 0 ? "+" : ""}${quantityChange} units recorded.`);
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["admin-products-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Adjustment failed.");
      throw e;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="eyebrow mb-1.5">Warehouse</div>
        <h1 className="headline text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and adjust stock across {allProducts.length} products. All adjustments are recorded to the audit log.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard icon={<AlertTriangle className="h-4 w-4 text-red-500" />}  label="Out of Stock"      value={outOfStock} color="text-red-500"    bg="bg-red-500/5 border-red-500/10" />
        <KPICard icon={<TrendingDown  className="h-4 w-4 text-amber-500" />} label="Low Stock (≤5)"  value={lowStock}   color="text-amber-500"  bg="bg-amber-500/5 border-amber-500/10" />
        <KPICard icon={<CheckCircle   className="h-4 w-4 text-green-600" />} label="Healthy Stock"   value={healthy}    color="text-green-600"  bg="bg-green-500/5 border-green-500/10" />
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category:</span>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-3 pr-7 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort:</span>
          {(["stock_asc", "stock_desc", "name"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                sortBy === s ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {s === "stock_asc" ? "Low → High" : s === "stock_desc" ? "High → Low" : "A–Z"}
            </button>
          ))}
        </div>

        {filterCategory !== "All" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
            {filterCategory}
            <button onClick={() => setFilterCategory("All")} className="hover:text-red-500 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      {filterCategory !== "All" && (
        <p className="text-xs text-muted-foreground -mt-2">
          Showing <span className="font-semibold text-foreground">{products.length}</span> of {allProducts.length} products
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-hairline overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Level</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Units</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {products.map((p) => {
                const status = stockStatus(p.stock_count);
                return (
                  <tr key={p.id} className="group hover:bg-muted/15 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover border border-hairline shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted border border-hairline shrink-0 flex items-center justify-center">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-sm text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 w-36">
                      <StockBar count={p.stock_count} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-base font-semibold tabular-nums">{p.stock_count}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setAdjustProduct(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-accent/8 hover:border-accent/30 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No products found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjust={handleAdjust}
        />
      )}
    </div>
  );
}

function KPICard({ icon, label, value, color, bg }: any) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${bg}`}>
      <div>{icon}</div>
      <div>
        <div className={`text-2xl font-bold tabular-nums headline ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}
