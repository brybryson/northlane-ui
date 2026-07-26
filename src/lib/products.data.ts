export type ProductCategory =
  | "Keyboards"
  | "Mouse"
  | "Audio"
  | "Monitors"
  | "Desks"
  | "Seating"
  | "Desk Accessories"
  | "Creator Gear"
  | "Smart Office"
  | "Power";

export interface AIAttributes {
  bestFor: (
    "Developers" | "Designers" | "Gamers" | "Content Creators" | "Office Workers" | "Students"
  )[];
  budgetTier: "Budget" | "Mid-Range" | "Premium";
  workspaceStyle: "Minimalist" | "Professional" | "Gaming" | "Creative" | "Architectural";
  badge?: "Best Seller" | "New Arrival" | "On Sale" | "Staff Pick";
  ergonomics?: "Basic" | "Ergonomic" | "Advanced Ergonomic";
  portability?: "Desktop" | "Portable" | "Travel-Friendly";
}

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  img: string;
  gallery: string[];
  description: string;
  inStock: boolean;
  stockCount: number;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  attributes: AIAttributes;
  specs: Record<string, string>;
  reviews: ProductReview[];
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // 1. KEYBOARDS (3 Products)
  {
    id: "kb-01",
    name: "Aster 65 Mechanical Keyboard",
    subtitle: "Silent tactile · Solid Walnut Base",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 4850,
    originalPrice: 5950,
    rating: 4.9,
    reviewsCount: 128,
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Crafted with double-damped hot-swappable tactile switches, CNC solid walnut base, and gasket-mount architecture for whisper-quiet typing.",
    inStock: true,
    stockCount: 18,
    featured: true,
    isBestSeller: true,
    attributes: {
      bestFor: ["Developers", "Office Workers", "Designers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
      badge: "Best Seller",
    },
    specs: {
      Layout: "65% Compact (68 Keys)",
      Switches: "Custom Northlane Quiet Tactile",
      Connectivity: "Bluetooth 5.3 + 2.4GHz + USB-C",
      Materials: "Solid Walnut & Anodized Plate",
      Warranty: "3-Year Studio Warranty",
    },
    reviews: [
      {
        id: "r1",
        author: "Marcus Vance",
        rating: 5,
        date: "July 18, 2026",
        title: "The quietest mechanical keyboard I have ever used",
        comment:
          "As a software engineer typing 8 hours a day, the solid walnut chassis eliminates pinging sound completely. Tactile feel is soft and buttery.",
        verified: true,
      },
    ],
  },
  {
    id: "kb-02",
    name: "Northlane Flow 75 Pro Keyboard",
    subtitle: "Low-profile Linear · CNC Aluminum",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 5450,
    originalPrice: 6250,
    rating: 4.8,
    reviewsCount: 94,
    img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Ultra-slim 75% layout with per-key RGB backlight, hot-swappable low-profile switches, and QMK/VIA key mapping support.",
    inStock: true,
    stockCount: 12,
    featured: true,
    isNew: true,
    attributes: {
      bestFor: ["Developers", "Gamers", "Students"],
      budgetTier: "Premium",
      workspaceStyle: "Professional",
      badge: "New Arrival",
    },
    specs: {
      Layout: "75% Exploded Layout",
      Switches: "Low-Profile Red Linear",
      Connectivity: "Wireless 2.4Ghz & Type-C",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "kb-03",
    name: "Northlane Ergo Split Keyboard",
    subtitle: "Ortholinear split · Palm Rests Included",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 6950,
    rating: 4.9,
    reviewsCount: 62,
    img: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Fully split ergonomic keyboard designed to relieve wrist strain and shoulder tightness during long coding sessions.",
    inStock: true,
    stockCount: 7,
    attributes: {
      bestFor: ["Developers", "Office Workers"],
      budgetTier: "Premium",
      workspaceStyle: "Minimalist",
      badge: "Staff Pick",
    },
    specs: {
      Layout: "Split Ortholinear 60%",
      Switches: "Silent Linear Dampened",
      Warranty: "3-Year Warranty",
    },
    reviews: [],
  },

  // 2. MOUSE (3 Products)
  {
    id: "m-01",
    name: "Nordic Wireless Precision Mouse",
    subtitle: "Ergonomic · Matte Graphite",
    category: "Mouse",
    brand: "Northlane Studio",
    price: 2950,
    originalPrice: 3450,
    rating: 4.9,
    reviewsCount: 156,
    img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Designed for precise natural hand orientation. 8,000 DPI glass tracking sensor with whisper-silent magnetic scroll wheel.",
    inStock: true,
    stockCount: 25,
    featured: true,
    isBestSeller: true,
    attributes: {
      bestFor: ["Designers", "Developers", "Office Workers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Professional",
      badge: "Best Seller",
    },
    specs: {
      Sensor: "Darkfield 8000 DPI Optical",
      Clicks: "Silent Tactile Microswitches",
      Warranty: "2-Year Studio Warranty",
    },
    reviews: [],
  },
  {
    id: "m-02",
    name: "Northlane Vertical Ergo Mouse",
    subtitle: "57-Degree Natural Grip Angle",
    category: "Mouse",
    brand: "Northlane Studio",
    price: 2450,
    rating: 4.7,
    reviewsCount: 48,
    img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Medical-grade vertical angle mouse promoting neutral forearm position for repetitive strain prevention.",
    inStock: true,
    stockCount: 15,
    attributes: {
      bestFor: ["Office Workers", "Developers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Angle: "57 Degrees",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "m-03",
    name: "Northlane Studio Stealth Mouse",
    subtitle: "Ultra-Lightweight · PTFE Glide Skates",
    category: "Mouse",
    brand: "Northlane Studio",
    price: 1850,
    rating: 4.8,
    reviewsCount: 72,
    img: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Featherlight 55-gram wireless mouse built with flawless optical tracking and zero-latency wireless connectivity.",
    inStock: true,
    stockCount: 20,
    attributes: {
      bestFor: ["Gamers", "Designers"],
      budgetTier: "Budget",
      workspaceStyle: "Gaming",
      badge: "On Sale",
    },
    specs: {
      Weight: "55 grams",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },

  // 3. AUDIO (3 Products)
  {
    id: "au-01",
    name: "Halo Studio ANC Headphones",
    subtitle: "Active Noise Cancelling · Memory Foam",
    category: "Audio",
    brand: "Bang & Olufsen",
    price: 5950,
    originalPrice: 6950,
    rating: 4.9,
    reviewsCount: 210,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Acoustic spatial audio drivers with adaptive noise isolation. Ultra-soft lambskin memory foam ear cushions for 30 hours of quiet focus.",
    inStock: true,
    stockCount: 14,
    featured: true,
    isBestSeller: true,
    attributes: {
      bestFor: ["Developers", "Content Creators", "Office Workers", "Students"],
      budgetTier: "Premium",
      workspaceStyle: "Minimalist",
      badge: "Best Seller",
    },
    specs: {
      Drivers: "40mm Custom Titanium",
      ANC: "Hybrid 4-Mic Active Noise Cancellation",
      Warranty: "3-Year International Warranty",
    },
    reviews: [],
  },
  {
    id: "au-02",
    name: "Northlane Studio Reference Speakers",
    subtitle: "Scandinavian Birch · 100W RMS",
    category: "Audio",
    brand: "Sonos",
    price: 6850,
    rating: 4.8,
    reviewsCount: 52,
    img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Compact near-field studio monitors with woven kevlar woofers and silk dome tweeters for pristine acoustic clarity.",
    inStock: true,
    stockCount: 9,
    featured: true,
    attributes: {
      bestFor: ["Content Creators", "Designers"],
      budgetTier: "Premium",
      workspaceStyle: "Architectural",
      badge: "Staff Pick",
    },
    specs: {
      Power: "100W Peak RMS",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "au-03",
    name: "Northlane Studio Reference Earbuds",
    subtitle: "Active ANC · Wireless Charging Case",
    category: "Audio",
    brand: "Northlane Studio",
    price: 3450,
    rating: 4.7,
    reviewsCount: 84,
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Compact in-ear wireless monitors with personalized sound profile tuning and IPX4 sweat resistance.",
    inStock: true,
    stockCount: 22,
    attributes: {
      bestFor: ["Office Workers", "Students", "Developers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Battery: "8 Hours + 24 Hours in Case",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },

  // 4. MONITORS (3 Products)
  {
    id: "mon-01",
    name: "Northlane UltraView 34 Ultrawide",
    subtitle: "34-inch Curved 4K OLED · 144Hz",
    category: "Monitors",
    brand: "Northlane Studio",
    price: 7450,
    rating: 4.9,
    reviewsCount: 45,
    img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Immersive 21:9 ultrawide OLED panel delivering infinite contrast ratio, 99% DCI-P3 color accuracy, and 90W USB-C power delivery.",
    inStock: true,
    stockCount: 5,
    featured: true,
    isNew: true,
    attributes: {
      bestFor: ["Developers", "Designers", "Gamers"],
      budgetTier: "Premium",
      workspaceStyle: "Professional",
      badge: "New Arrival",
    },
    specs: {
      Resolution: "3440 x 1440 UWQHD OLED",
      Warranty: "3-Year Burn-In Protection",
    },
    reviews: [],
  },
  {
    id: "mon-02",
    name: "Northlane Studio Clarity 27 Monitor",
    subtitle: "27-inch 4K IPS · 100% sRGB",
    category: "Monitors",
    brand: "Northlane Studio",
    price: 6450,
    rating: 4.8,
    reviewsCount: 64,
    img: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Ultra-sharp 4K IPS display engineered for color-accurate photo editing, code editing, and graphic design.",
    inStock: true,
    stockCount: 11,
    attributes: {
      bestFor: ["Designers", "Developers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Resolution: "3840 x 2160 UHD",
      Warranty: "3-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "mon-03",
    name: "Northlane Dual Monitor Mount Arm",
    subtitle: "Gas-Spring Suspension · Solid Aluminum",
    category: "Monitors",
    brand: "Northlane Studio",
    price: 2850,
    rating: 4.9,
    reviewsCount: 92,
    img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Heavy-duty dual monitor arm allowing smooth fluid motion, cable routing channels, and 360-degree rotation.",
    inStock: true,
    stockCount: 19,
    attributes: {
      bestFor: ["Developers", "Office Workers"],
      budgetTier: "Budget",
      workspaceStyle: "Professional",
    },
    specs: {
      Capacity: "Up to 32-inch monitors",
      Warranty: "5-Year Warranty",
    },
    reviews: [],
  },

  // 5. DESKS (3 Products)
  {
    id: "desk-01",
    name: "Northlane Lift Standing Desk",
    subtitle: "Solid American Walnut · Dual Motor",
    category: "Desks",
    brand: "Northlane Studio",
    price: 7450,
    originalPrice: 8250,
    rating: 5.0,
    reviewsCount: 75,
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Handcrafted solid walnut desktop paired with whisper-quiet dual electric motors and 4 memory height presets.",
    inStock: true,
    stockCount: 6,
    featured: true,
    isBestSeller: true,
    attributes: {
      bestFor: ["Developers", "Designers", "Office Workers"],
      budgetTier: "Premium",
      workspaceStyle: "Architectural",
      badge: "Best Seller",
    },
    specs: {
      Top: "Solid American Walnut",
      Motors: "Dual Silent Electric",
      Warranty: "10-Year Frame Warranty",
    },
    reviews: [],
  },
  {
    id: "desk-02",
    name: "Northlane Studio Compact Oak Desk",
    subtitle: "Scandi Solid Oak · Cable Drawer",
    category: "Desks",
    brand: "Northlane Studio",
    price: 5850,
    rating: 4.8,
    reviewsCount: 38,
    img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Minimalist compact desk designed for smaller home offices with integrated felt-lined stationery drawer.",
    inStock: true,
    stockCount: 8,
    attributes: {
      bestFor: ["Students", "Office Workers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Dimensions: "120cm x 60cm",
      Warranty: "5-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "desk-03",
    name: "Under-Desk Steel Storage Drawers",
    subtitle: "Modular Locking Cabinet · Soft-Close",
    category: "Desks",
    brand: "Northlane Studio",
    price: 2950,
    rating: 4.7,
    reviewsCount: 29,
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Sleek powder-coated steel mobile file cabinet matching solid walnut and oak desk finishes.",
    inStock: true,
    stockCount: 15,
    attributes: {
      bestFor: ["Office Workers", "Developers"],
      budgetTier: "Budget",
      workspaceStyle: "Professional",
    },
    specs: {
      Drawers: "3 Soft-Close Drawers",
      Warranty: "3-Year Warranty",
    },
    reviews: [],
  },

  // 6. SEATING (3 Products)
  {
    id: "chair-01",
    name: "Northlane Ergo Executive Chair",
    subtitle: "Breathable Mesh · 4D Armrests",
    category: "Seating",
    brand: "Herman Miller",
    price: 6850,
    rating: 4.9,
    reviewsCount: 112,
    img: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Advanced lumbar suspension chair engineered for posture alignment and 12-hour comfortable seating.",
    inStock: true,
    stockCount: 8,
    featured: true,
    attributes: {
      bestFor: ["Developers", "Office Workers"],
      budgetTier: "Premium",
      workspaceStyle: "Professional",
      badge: "Best Seller",
    },
    specs: {
      Lumbar: "Dynamic PostureFit",
      Warranty: "12-Year Studio Warranty",
    },
    reviews: [],
  },
  {
    id: "chair-02",
    name: "Northlane Studio Task Mesh Chair",
    subtitle: "Ergonomic Lumbar Support · Tilt Lock",
    category: "Seating",
    brand: "Northlane Studio",
    price: 4450,
    rating: 4.7,
    reviewsCount: 54,
    img: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Streamlined ergonomic desk chair featuring responsive lumbar support and high-density foam seat cushion.",
    inStock: true,
    stockCount: 12,
    attributes: {
      bestFor: ["Students", "Office Workers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Material: "High-Tension Mesh Backing",
      Warranty: "5-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "chair-03",
    name: "Northlane Active Ergonomic Stool",
    subtitle: "360-Degree Motion Base · Height Adjustable",
    category: "Seating",
    brand: "Northlane Studio",
    price: 2450,
    rating: 4.8,
    reviewsCount: 41,
    img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Dynamic wobble stool encouraging active sitting, core engagement, and seamless height changes with standing desks.",
    inStock: true,
    stockCount: 16,
    attributes: {
      bestFor: ["Developers", "Designers"],
      budgetTier: "Budget",
      workspaceStyle: "Creative",
    },
    specs: {
      Base: "Weighted Non-Slip Rubber",
      Warranty: "3-Year Warranty",
    },
    reviews: [],
  },

  // 7. DESK ACCESSORIES (3 Products)
  {
    id: "acc-01",
    name: "Meridian Warm Brass Desk Lamp",
    subtitle: "Warm Dimmable · Brushed Brass",
    category: "Desk Accessories",
    brand: "Grovemade",
    price: 2950,
    rating: 4.9,
    reviewsCount: 86,
    img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Solid brushed brass arch lamp featuring flicker-free 2700K warm LED light with smooth touch-dimming for evening editing.",
    inStock: true,
    stockCount: 11,
    featured: true,
    attributes: {
      bestFor: ["Designers", "Content Creators", "Office Workers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Architectural",
      badge: "Staff Pick",
    },
    specs: {
      Temperature: "2700K Warm Amber",
      Warranty: "5-Year Guarantee",
    },
    reviews: [],
  },
  {
    id: "acc-02",
    name: "Premium Felt & Walnut Desk Mat",
    subtitle: "Merino Wool Felt · Anti-slip Backing",
    category: "Desk Accessories",
    brand: "Grovemade",
    price: 890,
    rating: 4.9,
    reviewsCount: 310,
    img: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Genuine German merino wool felt mat adding warmth, acoustic dampening, and mouse precision to your workspace.",
    inStock: true,
    stockCount: 40,
    isBestSeller: true,
    attributes: {
      bestFor: ["Developers", "Designers", "Students", "Office Workers"],
      budgetTier: "Budget",
      workspaceStyle: "Minimalist",
      badge: "Best Seller",
    },
    specs: {
      Dimensions: "900mm x 400mm",
      Warranty: "Lifetime Guarantee",
    },
    reviews: [],
  },
  {
    id: "acc-03",
    name: "Solid Walnut Desk Shelf Riser",
    subtitle: "Dual Aluminum Legs · Ergonomic Eye Level",
    category: "Desk Accessories",
    brand: "Northlane Studio",
    price: 2450,
    rating: 4.9,
    reviewsCount: 118,
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Hand-crafted solid walnut desk shelf elevating your monitor while creating clean storage space underneath.",
    inStock: true,
    stockCount: 14,
    attributes: {
      bestFor: ["Developers", "Designers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Architectural",
    },
    specs: {
      Top: "Solid American Walnut",
      Warranty: "5-Year Warranty",
    },
    reviews: [],
  },

  // 8. CREATOR GEAR (3 Products)
  {
    id: "cg-01",
    name: "Creator 4K Pro Studio Webcam",
    subtitle: "Sony STARVIS Sensor · Dual Studio Mics",
    category: "Creator Gear",
    brand: "Logitech MX",
    price: 3450,
    rating: 4.8,
    reviewsCount: 88,
    img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Ultra HD 4K 60fps webcam with low-light auto-framing and magnetic privacy shutter.",
    inStock: true,
    stockCount: 16,
    attributes: {
      bestFor: ["Content Creators", "Office Workers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Professional",
      badge: "Best Seller",
    },
    specs: {
      Resolution: "4K UHD at 60fps",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "cg-02",
    name: "Northlane Studio Condenser Mic & Boom",
    subtitle: "Cardioid Capsule · Internal Shockmount",
    category: "Creator Gear",
    brand: "Northlane Studio",
    price: 4250,
    rating: 4.9,
    reviewsCount: 67,
    img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Broadcast-grade XLR & USB studio condenser microphone with silent low-profile desk arm.",
    inStock: true,
    stockCount: 10,
    attributes: {
      bestFor: ["Content Creators", "Developers"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Creative",
    },
    specs: {
      Capsule: "25mm Large Diaphragm",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "cg-03",
    name: "Northlane LED Studio Key Light Panel",
    subtitle: "Variable Color Temp (2700K - 6500K)",
    category: "Creator Gear",
    brand: "Northlane Studio",
    price: 2450,
    rating: 4.8,
    reviewsCount: 43,
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Edge-lit ultra-soft LED panel light providing shadow-free lighting for video calls and streaming.",
    inStock: true,
    stockCount: 18,
    attributes: {
      bestFor: ["Content Creators", "Office Workers"],
      budgetTier: "Budget",
      workspaceStyle: "Professional",
    },
    specs: {
      Brightness: "2800 Lumens Dimmable",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },

  // 9. SMART OFFICE (3 Products)
  {
    id: "so-01",
    name: "Northlane Air Quality Monitor",
    subtitle: "CO2, PM2.5, Humidity · OLED Display",
    category: "Smart Office",
    brand: "Northlane Studio",
    price: 1950,
    rating: 4.8,
    reviewsCount: 39,
    img: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Compact desk sensor measuring air purity, CO2 levels, temperature, and ventilation prompts.",
    inStock: true,
    stockCount: 21,
    attributes: {
      bestFor: ["Developers", "Office Workers", "Students"],
      budgetTier: "Mid-Range",
      workspaceStyle: "Minimalist",
    },
    specs: {
      Sensors: "NDIR CO2 Sensor",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "so-02",
    name: "Northlane E-Ink Desk Clock",
    subtitle: "Paper-like E-Ink · Calendar Sync",
    category: "Smart Office",
    brand: "Northlane Studio",
    price: 1450,
    rating: 4.9,
    reviewsCount: 81,
    img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Zero-glare E-Ink desktop display showing real-time calendar agenda, weather, and Pomodoro focus timers.",
    inStock: true,
    stockCount: 25,
    attributes: {
      bestFor: ["Developers", "Designers", "Students"],
      budgetTier: "Budget",
      workspaceStyle: "Minimalist",
      badge: "Staff Pick",
    },
    specs: {
      Screen: "4.2-inch E-Ink",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "so-03",
    name: "Northlane Smart Under-Desk Cable Tray",
    subtitle: "Powder-Coated Steel · Magnetic Clips",
    category: "Smart Office",
    brand: "Northlane Studio",
    price: 1250,
    rating: 4.9,
    reviewsCount: 145,
    img: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Heavy-duty clamp-on cable management raceway eliminating wire clutter under your workspace.",
    inStock: true,
    stockCount: 35,
    attributes: {
      bestFor: ["Developers", "Office Workers", "Designers"],
      budgetTier: "Budget",
      workspaceStyle: "Professional",
    },
    specs: {
      Length: "60cm High-Capacity Steel Tray",
      Warranty: "Lifetime Warranty",
    },
    reviews: [],
  },

  // 10. POWER (3 Products)
  {
    id: "pow-01",
    name: "MagSafe 3-in-1 Charging Stand",
    subtitle: "Solid Aluminum & Walnut Base",
    category: "Power",
    brand: "Grovemade",
    price: 1850,
    rating: 4.9,
    reviewsCount: 140,
    img: "https://images.unsplash.com/photo-1622445268465-843d63d06283?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1622445268465-843d63d06283?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Simultaneous 15W fast wireless charging for iPhone, Apple Watch, and AirPods.",
    inStock: true,
    stockCount: 30,
    isBestSeller: true,
    attributes: {
      bestFor: ["Developers", "Designers", "Students", "Office Workers"],
      budgetTier: "Budget",
      workspaceStyle: "Minimalist",
      badge: "Best Seller",
    },
    specs: {
      Output: "15W MagSafe + 5W Watch + 5W Pods",
      Warranty: "2-Year Guarantee",
    },
    reviews: [],
  },
  {
    id: "pow-02",
    name: "Northlane 100W GaN Studio Charger",
    subtitle: "4-Port Fast Charge · Compact GaN III",
    category: "Power",
    brand: "Northlane Studio",
    price: 1450,
    rating: 4.8,
    reviewsCount: 96,
    img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "High-speed 100W GaN desktop power hub charging laptops, tablets, and phones simultaneously.",
    inStock: true,
    stockCount: 24,
    attributes: {
      bestFor: ["Developers", "Content Creators", "Office Workers"],
      budgetTier: "Budget",
      workspaceStyle: "Professional",
    },
    specs: {
      Ports: "3x USB-C PD (100W Max) + 1x USB-A",
      Warranty: "2-Year Warranty",
    },
    reviews: [],
  },
  {
    id: "pow-03",
    name: "Northlane Braided Cable Management Hub",
    subtitle: "Silicone Organizers & Magnetic Dock",
    category: "Power",
    brand: "Northlane Studio",
    price: 490,
    rating: 4.9,
    reviewsCount: 110,
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Desktop magnetic cable anchors keeping charging cables securely positioned at your fingertips.",
    inStock: true,
    stockCount: 40,
    attributes: {
      bestFor: ["Developers", "Designers", "Students"],
      budgetTier: "Budget",
      workspaceStyle: "Minimalist",
      badge: "On Sale",
    },
    specs: {
      Anchors: "5 Magnetic Cable Collars",
      Warranty: "Lifetime Warranty",
    },
    reviews: [],
  },
];
