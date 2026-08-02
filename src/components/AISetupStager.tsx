import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ShoppingBag,
  Check,
  Plus,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Info,
  CheckCircle2,
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
    accentColor: "from-amber-500/20 to-orange-500/10",
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
    accentColor: "from-blue-500/20 to-indigo-500/10",
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
    accentColor: "from-emerald-500/20 to-teal-500/10",
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
    <section className="py-20 bg-stone-950 text-stone-100 overflow-hidden relative border-y border-stone-800/80">
      {/* Background Decorative Lighting Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Interactive AI Setup Stager</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-white font-medium">
            Stage Your Dream Workspace
          </h2>
          <p className="mt-4 text-stone-400 text-base sm:text-lg font-light leading-relaxed">
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
                className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2.5 ${
                  isActive
                    ? "bg-stone-800 text-white shadow-xl shadow-stone-950/80 border border-stone-700 ring-1 ring-amber-500/40"
                    : "bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800/80"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-amber-400 animate-ping" : "bg-stone-600"
                  }`}
                />
                <span>{preset.title}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-950/80 text-amber-400 border border-amber-500/20">
                  Save {preset.discountPercentage}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas Stager (7 Columns) */}
          <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl">
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
                  className="w-full h-full object-cover brightness-[0.88] contrast-[1.05] transition-all duration-700 group-hover:scale-[1.02]"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-tr ${activePreset.accentColor} mix-blend-overlay`} />

                {/* Vibe Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950/80 border border-stone-800 backdrop-blur-md text-xs text-stone-300 font-mono">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vibe: {activePreset.vibe}</span>
                </div>

                {/* Interactive Hotspot Pins */}
                {activePreset.items.map((item, idx) => {
                  const isSelected = activeItemPin?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{ top: `${item.yPercent}%`, left: `${item.xPercent}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      {/* Pulse Ring */}
                      <button
                        onClick={() => setActiveItemPin(isSelected ? null : item)}
                        className={`relative group/pin flex items-center justify-center p-2 rounded-full transition-transform duration-300 hover:scale-125 ${
                          isSelected
                            ? "bg-amber-400 text-stone-950 ring-4 ring-amber-400/40 shadow-lg shadow-amber-500/50"
                            : "bg-stone-950/90 text-amber-400 border border-amber-400/60 shadow-md backdrop-blur-md"
                        }`}
                        title={item.name}
                      >
                        <span className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
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
                            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 rounded-xl bg-stone-900/95 border border-stone-700/80 shadow-2xl backdrop-blur-xl z-50 text-left"
                          >
                            <div className="flex gap-3 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover border border-stone-700"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                                  {item.category}
                                </span>
                                <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-amber-400">${item.price}</span>
                                  <span className="text-[10px] text-stone-500 line-through">
                                    ${item.originalPrice}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 leading-tight">
                              {item.description}
                            </p>

                            <button
                              onClick={() => handleAddSingleItem(item)}
                              className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-stone-700 hover:border-amber-400"
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
            <div className="p-4 bg-stone-900/90 border-t border-stone-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-400 font-light">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Click interactive hotspots on the canvas to inspect setup gear.</span>
              </div>
              <div className="text-xs font-mono text-amber-400 shrink-0">
                {activePreset.items.length} Curated Gear Items
              </div>
            </div>
          </div>

          {/* Right Bundle Summary Sidebar (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-xl backdrop-blur-sm relative overflow-hidden">
              {/* Highlight Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  Setup Bundle Breakdown
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>Bundle Discount Active</span>
                </span>
              </div>

              <h3 className="text-2xl font-serif font-medium text-white">{activePreset.title}</h3>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed font-light">
                {activePreset.description}
              </p>

              {/* Items List */}
              <div className="mt-6 space-y-3">
                {activePreset.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemPin(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      activeItemPin?.id === item.id
                        ? "bg-stone-800/90 border-amber-500/60 shadow-md ring-1 ring-amber-500/30"
                        : "bg-stone-950/50 border-stone-800 hover:border-stone-700 hover:bg-stone-950/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-medium text-stone-200 truncate">{item.name}</h5>
                        <span className="text-[10px] text-stone-400 font-mono block">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-stone-200">${item.price}</div>
                      <div className="text-[10px] text-stone-500 line-through">${item.originalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary Box */}
              <div className="mt-6 p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Individual Items Retail</span>
                  <span className="line-through text-stone-500">${originalTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-400 font-medium">
                  <span>Bundle Savings ({activePreset.discountPercentage}%)</span>
                  <span>-${totalSavings}</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-stone-400 block font-light">Complete Setup Price</span>
                    <span className="text-2xl font-bold font-mono text-white">${finalBundlePrice}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Save ${totalSavings} Total
                  </span>
                </div>
              </div>

              {/* 1-Click Buy Full Setup CTA */}
              <button
                onClick={handleAddFullSetup}
                disabled={isAddingBundle}
                className="mt-6 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-semibold text-sm transition-all duration-300 transform active:scale-[0.99] shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isAddingBundle ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-stone-950" />
                    <span>Add Full Setup to Bag (${finalBundlePrice})</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Guarantee Footer */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-stone-400 font-light">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  3-Year Studio Warranty
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
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
