import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listProducts, upsertProduct, deleteProduct } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Plus, Trash2, Search, Sparkles, Image, Upload,
  AlertTriangle, X, Package, Star, Tag, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsManagerPage,
});

type DBProduct = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  brand: string;
  price: number;
  original_price: number | null;
  image_url: string;
  gallery: string[];
  description: string;
  in_stock: boolean;
  stock_count: number;
  featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  attributes: {
    bestFor?: string[];
    budgetTier?: string;
    workspaceStyle?: string;
    badge?: string;
    ergonomics?: string;
    portability?: string;
  };
  specs: Record<string, string>;
};

function emptyProduct(): DBProduct {
  return {
    id: "",
    name: "",
    subtitle: "",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 0,
    original_price: null,
    image_url: "",
    gallery: [],
    description: "",
    in_stock: true,
    stock_count: 0,
    featured: false,
    is_new: false,
    is_bestseller: false,
    attributes: {
      bestFor: [],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
      badge: "None",
    },
    specs: {},
  };
}

const CATEGORIES = [
  "Keyboards", "Mouse", "Audio", "Monitors", "Desks",
  "Seating", "Desk Accessories", "Creator Gear", "Smart Office", "Power",
];
const BUDGET_TIERS = ["Budget", "Mid-Range", "Premium"];
const WORKSPACE_STYLES = ["Minimalist", "Professional", "Gaming", "Creative", "Architectural"];
const BADGES = ["None", "Best Seller", "New Arrival", "On Sale", "Staff Pick"];
const PERSONAS = ["Developers", "Designers", "Gamers", "Content Creators", "Office Workers", "Students"];

const BADGE_STYLES: Record<string, string> = {
  "Best Seller": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "New Arrival": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "On Sale": "bg-red-500/10 text-red-600 border-red-500/20",
  "Staff Pick": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

/* ─── Confirm Modal ─── */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-background rounded-2xl border border-hairline shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-hairline bg-muted/20 px-6 py-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
function ProductsManagerPage() {
  const qc = useQueryClient();
  const getProducts = useServerFn(listProducts);
  const saveProduct = useServerFn(upsertProduct);
  const removeProduct = useServerFn(deleteProduct);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterBadge, setFilterBadge] = useState("All");
  const [editing, setEditing] = useState<DBProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DBProduct | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: () => getProducts({}),
  });

  const filtered = (products as DBProduct[] | undefined)?.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || p.category === filterCategory;
    const matchBadge =
      filterBadge === "All" ||
      (filterBadge === "None"
        ? !p.attributes?.badge || p.attributes.badge === "None"
        : p.attributes?.badge === filterBadge);
    return matchSearch && matchCategory && matchBadge;
  });

  async function handleSave(row: DBProduct) {
    if (!row.id) { toast.error("Product ID / SKU is required."); return; }
    try {
      await saveProduct({ data: row });
      toast.success(editing?.id ? "Product updated." : "Product created.");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeProduct({ data: { id } });
      toast.success("Product deleted.");
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["admin-products-list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-1.5">Catalog Management</div>
          <h1 className="headline text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products?.length ?? 0} items · Synced with AI Shopping Assistant
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyProduct())}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-foreground/90 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </div>

      {/* Search + Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or category..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm bg-background border border-border rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Badge Filter */}
        <div className="relative">
          <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm bg-background border border-border rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all cursor-pointer"
          >
            <option value="All">All Badges</option>
            {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Active filter chips */}
        {(filterCategory !== "All" || filterBadge !== "All") && (
          <div className="flex items-center gap-2">
            {filterCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
                {filterCategory}
                <button onClick={() => setFilterCategory("All")} className="hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterBadge !== "All" && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/8 border border-border text-foreground">
                {filterBadge}
                <button onClick={() => setFilterBadge("All")} className="hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setFilterCategory("All"); setFilterBadge("All"); }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Result count */}
      {(filterCategory !== "All" || filterBadge !== "All" || search) && (
        <p className="text-xs text-muted-foreground -mt-2">
          Showing <span className="font-semibold text-foreground">{filtered?.length ?? 0}</span> of {products?.length ?? 0} products
        </p>
      )}

      {/* Product Grid Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-xl border border-hairline bg-surface/30 p-12 text-center">
          <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No products found.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or add a new product.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-hairline overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface/50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden lg:table-cell">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden lg:table-cell">Badges</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((p) => (
                <tr key={p.id} className="group hover:bg-muted/20 transition-colors">
                  {/* Product */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover border border-hairline shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted border border-hairline flex items-center justify-center shrink-0">
                          <Image className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate max-w-[180px]">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="text-sm text-foreground/80">{p.category}</div>
                    <div className="text-[11px] text-muted-foreground">{p.brand}</div>
                  </td>
                  {/* Price */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="font-semibold tabular-nums">₱{p.price.toLocaleString()}</div>
                    {p.original_price && (
                      <div className="text-[11px] text-muted-foreground line-through tabular-nums">
                        ₱{p.original_price.toLocaleString()}
                      </div>
                    )}
                  </td>
                  {/* Stock */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {p.in_stock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-500/10 border border-green-500/15 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                        {p.stock_count} in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-500/10 border border-red-500/15 px-2 py-0.5 rounded-full">
                        Out of stock
                      </span>
                    )}
                  </td>
                  {/* Badges */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {p.attributes?.badge && p.attributes.badge !== "None" && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${BADGE_STYLES[p.attributes.badge] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {p.attributes.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(p as DBProduct)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p as DBProduct)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / New Product Modal */}
      {editing && (
        <ProductModal
          value={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete product?"
          message={`This will permanently remove "${confirmDelete.name}" from your catalog. This action cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ─── Product Modal (Edit / New) ─── */
function ProductModal({
  value,
  onSave,
  onClose,
}: {
  value: DBProduct;
  onSave: (p: DBProduct) => void;
  onClose: () => void;
}) {
  const [row, setRow] = useState<DBProduct>(value);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [uploading, setUploading] = useState(false);
  const isEdit = !!value.id;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(`products/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(`products/${fileName}`);
      setRow({ ...row, image_url: publicUrl });
      toast.success("Image uploaded.");
    } catch {
      toast.error("Upload failed. Please paste an image URL instead.");
    } finally {
      setUploading(false);
    }
  }

  function addSpec() {
    if (!specKey.trim() || !specVal.trim()) return;
    setRow({ ...row, specs: { ...row.specs, [specKey.trim()]: specVal.trim() } });
    setSpecKey("");
    setSpecVal("");
  }

  function removeSpec(key: string) {
    const next = { ...row.specs };
    delete next[key];
    setRow({ ...row, specs: next });
  }

  function togglePersona(p: string) {
    const cur = row.attributes.bestFor ?? [];
    setRow({
      ...row,
      attributes: {
        ...row.attributes,
        bestFor: cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-xl border border-hairline shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-hairline px-7 py-5 flex items-center justify-between">
          <div>
            <div className="eyebrow mb-0.5">{isEdit ? "Editing Product" : "New Product"}</div>
            <h3 className="font-semibold text-base tracking-tight">{isEdit ? row.name : "Add to Catalog"}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(row); }} className="px-7 py-6 space-y-6">

          {/* SECTION: Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product ID / SKU">
                <input
                  value={row.id}
                  disabled={isEdit}
                  onChange={(e) => setRow({ ...row, id: e.target.value })}
                  className="field-input font-mono"
                  placeholder="kb-04"
                  required
                />
              </Field>
              <Field label="Brand">
                <input
                  value={row.brand}
                  onChange={(e) => setRow({ ...row, brand: e.target.value })}
                  className="field-input"
                  placeholder="Northlane Studio"
                  required
                />
              </Field>
            </div>
            <Field label="Product Name">
              <input
                value={row.name}
                onChange={(e) => setRow({ ...row, name: e.target.value })}
                className="field-input"
                placeholder="e.g. Amber Key Light"
                required
              />
            </Field>
            <Field label="Subtitle / Tagline">
              <input
                value={row.subtitle}
                onChange={(e) => setRow({ ...row, subtitle: e.target.value })}
                className="field-input"
                placeholder="e.g. Warm Dimmable · Walnut Base"
              />
            </Field>
            <Field label="Category">
              <div className="relative">
                <select
                  value={row.category}
                  onChange={(e) => setRow({ ...row, category: e.target.value })}
                  className="field-input appearance-none pr-8"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </Field>
          </Section>

          {/* SECTION: Pricing & Stock */}
          <Section title="Pricing & Stock">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Price (₱)">
                <input
                  type="number"
                  value={row.price || ""}
                  onChange={(e) => setRow({ ...row, price: Number(e.target.value) })}
                  className="field-input tabular-nums"
                  placeholder="4850"
                  required
                />
              </Field>
              <Field label="Original Price (₱)">
                <input
                  type="number"
                  value={row.original_price || ""}
                  onChange={(e) => setRow({ ...row, original_price: Number(e.target.value) || null })}
                  className="field-input tabular-nums"
                  placeholder="Optional"
                />
              </Field>
              <Field label="Stock Count">
                <input
                  type="number"
                  value={row.stock_count}
                  onChange={(e) => setRow({ ...row, stock_count: Number(e.target.value), in_stock: Number(e.target.value) > 0 })}
                  className="field-input tabular-nums"
                  required
                />
              </Field>
            </div>
            <div className="flex gap-5 pt-1">
              {([
                ["featured", "Featured"],
                ["is_new", "New Arrival"],
                ["is_bestseller", "Best Seller"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-sm select-none">
                  <input
                    type="checkbox"
                    checked={row[key] as boolean}
                    onChange={(e) => setRow({ ...row, [key]: e.target.checked })}
                    className="rounded border-border accent-foreground"
                  />
                  <span className="text-foreground/80 font-medium">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* SECTION: Media */}
          <Section title="Product Image">
            {row.image_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-hairline mb-3 bg-muted">
                <img src={row.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <Field label="Image URL">
              <input
                value={row.image_url}
                onChange={(e) => setRow({ ...row, image_url: e.target.value })}
                className="field-input"
                placeholder="https://..."
                required
              />
            </Field>
            <label className="inline-flex items-center gap-2 mt-2 border border-border hover:bg-muted/50 bg-background px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload from device
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </Section>

          {/* SECTION: Description */}
          <Section title="Description">
            <textarea
              value={row.description}
              onChange={(e) => setRow({ ...row, description: e.target.value })}
              rows={3}
              className="field-input resize-none"
              placeholder="Crafted with hot-swappable switches..."
              required
            />
          </Section>

          {/* SECTION: AI Attributes */}
          <Section title="AI Shopping Properties" icon={<Sparkles className="h-3.5 w-3.5 text-accent" />}>
            <div className="grid grid-cols-2 gap-4">
              {([
                ["Budget Tier", "budgetTier", BUDGET_TIERS],
                ["Workspace Style", "workspaceStyle", WORKSPACE_STYLES],
                ["Collection Badge", "badge", BADGES],
              ] as [string, keyof typeof row.attributes, string[]][]).map(([label, key, opts]) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <select
                      value={(row.attributes[key] as string) ?? ""}
                      onChange={(e) => setRow({ ...row, attributes: { ...row.attributes, [key]: e.target.value } })}
                      className="field-input appearance-none pr-8"
                    >
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Target Audience</div>
              <div className="flex flex-wrap gap-2">
                {PERSONAS.map((p) => {
                  const active = row.attributes.bestFor?.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePersona(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* SECTION: Technical Specifications */}
          <Section title="Technical Specifications">
            {/* Existing specs */}
            {Object.keys(row.specs).length > 0 && (
              <div className="divide-y divide-hairline rounded-lg border border-hairline overflow-hidden mb-3">
                {Object.entries(row.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-2.5 bg-surface/30 text-sm">
                    <div>
                      <span className="font-semibold text-foreground/70">{k}</span>
                      <span className="text-muted-foreground"> — {v}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpec(k)}
                      className="text-muted-foreground hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add spec row */}
            <div className="flex gap-2">
              <input
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Key (e.g. Connectivity)"
                className="field-input flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())}
              />
              <input
                value={specVal}
                onChange={(e) => setSpecVal(e.target.value)}
                placeholder="Value (e.g. Bluetooth 5.3)"
                className="field-input flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())}
              />
              <button
                type="button"
                onClick={addSpec}
                className="px-4 py-2 bg-muted border border-border rounded-lg text-sm font-semibold hover:bg-muted/80 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </Section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 shadow-sm transition-all"
            >
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Shared form primitives ─── */
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground/80">{label}</label>
      {children}
    </div>
  );
}
