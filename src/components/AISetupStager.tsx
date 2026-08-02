import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info,
  CheckCircle2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cart-context";

// Assets
import heroWorkspace from "@/assets/hero-workspace.jpg";
import lifestyleDeveloper from "@/assets/lifestyle-developer.jpg";
import lifestyleDesigner from "@/assets/lifestyle-designer.jpg";
import lifestyleHome from "@/assets/lifestyle-home.jpg";
import productKeyboard from "@/assets/product-keyboard.jpg";
import productMouse from "@/assets/product-mouse.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLamp from "@/assets/product-lamp.jpg";

export interface StagerItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  sku: string;
  description: string;
  xPercent: number; // Hotspot position X percentage (0-100)
  yPercent: number; // Hotspot position Y percentage (0-100)
}

export interface SetupPreset {
  id: string;
  title: string;
  tagline: string;
  vibe: string;
  discountPercentage: number;
  bgImage: string;
  accentColor: string;
  description: string;
  items: StagerItem[];
}

const PRESETS: SetupPreset[] = [
  {
    id: "nordic-minimalist",
    title: "Copenhagen Minimalist",
    tagline: "Natural oak, tactile felt & serene acoustic focus",
    vibe: "Quiet Architecture",
    discountPercentage: 15,
    bgImage: heroWorkspace,
    accentColor: "from-amber-500/10 to-orange-500/5",
    description:
      "Engineered for deep creative work. Pairs natural solid oak wood textures with soft acoustic felt desk mats and low-profile ergonomics.",
    items: [
      {
        id: "prod-oak-mat",
        name: "Northlane Solid Oak Wool Desk Mat",
        category: "Accessories",
        price: 85,
        originalPrice: 100,
        image: lifestyleDesigner,
        sku: "NL-MAT-OAK",
        description: "100% Merino wool felt underlay with sustainably harvested Danish oak trim.",
        xPercent: 48,
        yPercent: 72,
      },
      {
        id: "prod-kb-minimal",
        name: "Ergonomic Low-Profile Mechanical Keyboard",
        category: "Keyboards",
        price: 210,
        originalPrice: 245,
        image: productKeyboard,
        sku: "NL-KB-85",
        description: "CNC-anodized aluminum frame with silent lubricated linear switches.",
        xPercent: 45,
        yPercent: 55,
      },
      {
        id: "prod-brass-lamp",
        name: "Minimalist Brass Desk Task Lamp",
        category: "Lighting",
        price: 140,
        originalPrice: 165,
        image: productLamp,
        sku: "NL-LMP-BR",
        description: "Warm CRI 98+ dimmable architectural LED task lighting.",
        xPercent: 78,
        yPercent: 32,
      },
      {
        id: "prod-mouse-precision",
        name: "Precision Ergonomic Wireless Mouse",
        category: "Accessories",
        price: 115,
        originalPrice: 135,
        image: productMouse,
        sku: "NL-MS-PRO",
        description: "Dual wireless sensor with customizable magnetic thumb dial.",
        xPercent: 64,
        yPercent: 58,
      },
    ],
  },
  {
    id: "dark-mode-dev",
    title: "Dark Mode Developer",
    tagline: "Stealth matte black, high-tactile switches & dual-arm ergonomics",
    vibe: "Software Engineering",
    discountPercentage: 18,
    bgImage: lifestyleDeveloper,
    accentColor: "from-blue-500/10 to-indigo-500/5",
    description:
      "Built for long coding marathons. Focused light output, high-tactile hot-swappable switches, and zero-clutter cable routing.",
    items: [
      {
        id: "prod-kb-monolith",
        name: "Monolith Wireless Hot-Swap Keyboard",
        category: "Keyboards",
        price: 245,
        originalPrice: 285,
        image: productKeyboard,
        sku: "NL-KB-DEV",
        description: "Hot-swappable PCB with custom PBT double-shot keycaps in obsidian black.",
        xPercent: 46,
        yPercent: 62,
      },
      {
        id: "prod-hp-studio",
        name: "Acoustic Noise-Isolating Headphones",
        category: "Audio",
        price: 320,
        originalPrice: 380,
        image: productHeadphones,
        sku: "NL-AUD-PRO",
        description: "50mm neodymium planar drivers tuned for pure spatial audio clarity.",
        xPercent: 22,
        yPercent: 42,
      },
      {
        id: "prod-mouse-precision-black",
        name: "Matte Stealth Precision Mouse",
        category: "Accessories",
        price: 115,
        originalPrice: 135,
        image: productMouse,
        sku: "NL-MS-BLK",
        description: "Ultra-lightweight magnesium alloy shell with 8K polling rate.",
        xPercent: 68,
        yPercent: 64,
      },
      {
        id: "prod-lamp-stealth",
        name: "Architectural ScreenBar Monitor Light",
        category: "Lighting",
        price: 130,
        originalPrice: 150,
        image: productLamp,
        sku: "NL-LMP-BAR",
        description: "Zero glare monitor light bar with auto-dimming ambient sensor.",
        xPercent: 52,
        yPercent: 25,
      },
    ],
  },
  {
    id: "executive-studio",
    title: "Executive Studio Creator",
    tagline: "Walnut timber, planar magnetic audio & studio broadcast gear",
    vibe: "Creative Direction",
    discountPercentage: 20,
    bgImage: lifestyleHome,
    accentColor: "from-emerald-500/10 to-teal-500/5",
    description:
      "Designed for podcast hosts, digital artists, and executive leaders. Impeccable timber craftsmanship paired with broadcast-quality audio equipment.",
    items: [
      {
        id: "prod-walnut-riser",
        name: "American Walnut Solid Wood Desk Shelf",
        category: "Furniture",
        price: 165,
        originalPrice: 195,
        image: lifestyleHome,
        sku: "NL-SHF-WAL",
        description: "Hand-finished solid American walnut monitor riser with aluminum tray.",
        xPercent: 50,
        yPercent: 40,
      },
      {
        id: "prod-hp-planar",
        name: "Planar Audiophile Open-Back Headphones",
        category: "Audio",
        price: 450,
        originalPrice: 520,
        image: productHeadphones,
        sku: "NL-AUD-PLANAR",
        description: "Referenced soundstage audio with plush lambskin memory foam pads.",
        xPercent: 76,
        yPercent: 54,
      },
      {
        id: "prod-kb-executive",
        name: "Northlane Brass Accent Mechanical Keyboard",
        category: "Keyboards",
        price: 260,
        originalPrice: 310,
        image: productKeyboard,
        sku: "NL-KB-EXEC",
        description: "Full brass bottom weight plate with custom oiled tactile switches.",
        xPercent: 42,
        yPercent: 68,
      },
    ],
  },
];

export const AISetupStager: React.FC = () => {
  const [activePresetId, setActivePresetId] = useState<string>("nordic-minimalist");
  const [activeItemPin, setActiveItemPin] = useState<StagerItem | null>(null);
  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const { addToCart } = useCart();

  const activePreset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];

  // Calculate pricing metrics
  const originalTotal = activePreset.items.reduce((sum, item) => sum + item.originalPrice, 0);
  const rawSubtotal = activePreset.items.reduce((sum, item) => sum + item.price, 0);
  const bundleDiscountAmount = Math.round((rawSubtotal * activePreset.discountPercentage) / 100);
  const finalBundlePrice = rawSubtotal - bundleDiscountAmount;
  const totalSavings = originalTotal - finalBundlePrice;

  const handleAddFullSetup = () => {
    setIsAddingBundle(true);
    let addedCount = 0;

    activePreset.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: Math.round(item.price * (1 - activePreset.discountPercentage / 100)),
        originalPrice: item.originalPrice,
        image: item.image,
        category: item.category,
        sku: item.sku,
        quantity: 1,
      });
      addedCount++;
    });

    setTimeout(() => {
      setIsAddingBundle(false);
      toast.success(`Complete "${activePreset.title}" setup added to your studio bag! (${addedCount} items)`, {
        description: `You saved $${totalSavings} with the full bundle discount.`,
        position: "bottom-right",
      });
    }, 400);
  };

  const handleAddSingleItem = (item: StagerItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
      sku: item.sku,
      quantity: 1,
    });
  };

  return (
    <section className="py-20 lg:py-28 bg-surface border-y border-hairline relative text-foreground selection:bg-accent/20">
      <div className="container-editorial">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="eyebrow mb-3 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Interactive AI Setup Stager</span>
          </div>

          <h2 className="headline text-3xl sm:text-4xl lg:text-5xl font-serif">
            Stage Your Dream Workspace
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Explore curated workspace aesthetics, inspect individual precision components in interactive 3D position,
            and bundle your complete desk setup with 1-click discount savings.
          </p>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {PRESETS.map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePresetId(preset.id);
                  setActiveItemPin(null);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2.5 cursor-pointer border ${
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:text-foreground border-hairline hover:border-foreground/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-accent" : "bg-muted-foreground/40"
                  }`}
                />
                <span>{preset.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? "bg-background/20 text-background" : "bg-surface text-accent border border-accent/20"
                }`}>
                  Save {preset.discountPercentage}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas Stager (7 Columns) */}
          <div className="lg:col-span-7 relative group rounded-3xl overflow-hidden border border-hairline bg-background shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePreset.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.4 }}
                className="relative aspect-[4/3] sm:aspect-[16/10] w-full"
              >
                {/* Background Staging Image */}
                <img
                  src={activePreset.bgImage}
                  alt={activePreset.title}
                  className="w-full h-full object-cover contrast-[1.03] transition-all duration-700 group-hover:scale-[1.02]"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                {/* Vibe Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 border border-hairline backdrop-blur-md text-xs text-foreground font-medium shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>Vibe: {activePreset.vibe}</span>
                </div>

                {/* Interactive Hotspot Pins */}
                {activePreset.items.map((item) => {
                  const isSelected = activeItemPin?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{ top: `${item.yPercent}%`, left: `${item.xPercent}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      {/* Hotspot Button */}
                      <button
                        onClick={() => setActiveItemPin(isSelected ? null : item)}
                        className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${
                          isSelected
                            ? "bg-foreground text-background shadow-lg ring-4 ring-foreground/20"
                            : "bg-background/90 text-foreground border border-hairline shadow-md backdrop-blur-md hover:border-foreground"
                        }`}
                        title={item.name}
                      >
                        <Plus
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isSelected ? "rotate-45" : ""
                          }`}
                        />
                      </button>

                      {/* Hotspot Floating Tooltip Card */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3.5 rounded-2xl bg-background border border-hairline shadow-2xl backdrop-blur-xl z-50 text-left"
                          >
                            <div className="flex gap-3 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-hairline"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-mono text-accent uppercase tracking-wider block font-semibold">
                                  {item.category}
                                </span>
                                <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-foreground">${item.price}</span>
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    ${item.originalPrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-tight">
                              {item.description}
                            </p>

                            <button
                              onClick={() => handleAddSingleItem(item)}
                              className="mt-3 w-full py-1.5 px-3 rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add Single Item</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Stager Banner Info */}
            <div className="p-4 bg-background/90 border-t border-hairline flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-accent shrink-0" />
                <span>Click interactive hotspots on the canvas to inspect setup gear.</span>
              </div>
              <div className="text-xs font-mono font-semibold text-foreground shrink-0">
                {activePreset.items.length} Curated Items
              </div>
            </div>
          </div>

          {/* Right Bundle Summary Sidebar (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-background border border-hairline shadow-md backdrop-blur-sm relative overflow-hidden">
              {/* Highlight Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Setup Bundle Breakdown
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>Bundle Discount Active</span>
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-foreground">{activePreset.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {activePreset.description}
              </p>

              {/* Items List */}
              <div className="mt-6 space-y-3">
                {activePreset.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemPin(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      activeItemPin?.id === item.id
                        ? "bg-surface border-foreground shadow-sm"
                        : "bg-background border-hairline hover:border-foreground/30 hover:bg-surface/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-hairline shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-foreground truncate">{item.name}</h5>
                        <span className="text-[10px] text-muted-foreground font-mono block">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-foreground">${item.price}</div>
                      <div className="text-[10px] text-muted-foreground line-through">${item.originalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary Box */}
              <div className="mt-6 p-4 rounded-2xl bg-surface border border-hairline space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Individual Items Retail</span>
                  <span className="line-through">${originalTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-accent font-semibold">
                  <span>Bundle Savings ({activePreset.discountPercentage}%)</span>
                  <span>-${totalSavings}</span>
                </div>
                <div className="pt-2 border-t border-hairline flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-muted-foreground block">Complete Setup Price</span>
                    <span className="text-2xl font-bold font-serif text-foreground">${finalBundlePrice}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Save ${totalSavings} Total
                  </span>
                </div>
              </div>

              {/* 1-Click Buy Full Setup CTA */}
              <button
                onClick={handleAddFullSetup}
                disabled={isAddingBundle}
                className="mt-6 w-full py-3.5 px-6 rounded-full bg-foreground hover:bg-foreground/90 text-background font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {isAddingBundle ? (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-background" />
                    <span>Add Full Setup to Bag (${finalBundlePrice})</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Guarantee Footer */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  3-Year Studio Warranty
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  Free Global Express Shipping
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
