/**
 * Sample catalog used by the seed script and by scripts/generate-product-images.ts.
 * Every product is fictional. `icon` and `palette` only drive the generated product artwork.
 */
export interface SeedCategory {
  name: string;
  slug: string;
}

export interface SeedProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  stock: number;
  featured?: boolean;
  category: string;
  icon: string;
  palette: [background: string, accent: string, ink: string];
}

export const categories: SeedCategory[] = [
  { name: 'Audio', slug: 'audio' },
  { name: 'Workspace', slug: 'workspace' },
  { name: 'Home', slug: 'home' },
  { name: 'Kitchen', slug: 'kitchen' },
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Outdoors', slug: 'outdoors' },
];

export const products: SeedProduct[] = [
  // Audio
  {
    slug: 'aurora-wireless-headphones',
    name: 'Aurora Wireless Headphones',
    tagline: 'Adaptive noise cancelling, 40-hour battery',
    description:
      'Aurora blends rich, balanced sound with adaptive noise cancelling that tunes itself to your surroundings. Memory-foam ear cushions keep long listening sessions comfortable, and a 10-minute charge gives you five hours of playback.',
    priceCents: 18900,
    stock: 14,
    featured: true,
    category: 'audio',
    icon: 'headphones',
    palette: ['#E8EEFF', '#B9C8FF', '#2D3A8C'],
  },
  {
    slug: 'pulse-portable-speaker',
    name: 'Pulse Portable Speaker',
    tagline: 'Room-filling 360° sound, waterproof',
    description:
      'A compact speaker with a surprisingly big voice. Pulse is IP67 waterproof, pairs two units for stereo, and runs for 18 hours on a single charge.',
    priceCents: 7900,
    stock: 22,
    category: 'audio',
    icon: 'speaker',
    palette: ['#FFF0E6', '#FFC9A3', '#8A3B12'],
  },
  {
    slug: 'echo-studio-microphone',
    name: 'Echo Studio Microphone',
    tagline: 'USB-C condenser mic for crisp calls and podcasts',
    description:
      'Echo captures warm, broadcast-quality vocals with a cardioid pattern that rejects background noise. Plug-and-play USB-C, a zero-latency headphone jack, and a sturdy desk stand are included.',
    priceCents: 12900,
    stock: 3,
    category: 'audio',
    icon: 'mic',
    palette: ['#F1ECFF', '#D2C4FF', '#4B2E9E'],
  },
  {
    slug: 'drift-earbuds',
    name: 'Drift True Wireless Earbuds',
    tagline: 'Featherlight fit with spatial audio',
    description:
      'Drift earbuds weigh just 4 grams each and include three sizes of silicone tips. Spatial audio, transparency mode, and a pocket-sized wireless charging case come standard.',
    priceCents: 9900,
    stock: 0,
    category: 'audio',
    icon: 'ear',
    palette: ['#E6F7F4', '#AEE5DA', '#11594C'],
  },

  // Workspace
  {
    slug: 'lumen-desk-lamp',
    name: 'Lumen LED Desk Lamp',
    tagline: 'Glare-free light with five colour temperatures',
    description:
      'Lumen gives you even, flicker-free light across your whole desk. Tune the colour from warm to daylight, dim smoothly with a touch, and charge your phone from the built-in USB-C port.',
    priceCents: 6400,
    stock: 18,
    featured: true,
    category: 'workspace',
    icon: 'lamp-desk',
    palette: ['#FFF8E1', '#FFE08A', '#7A5A00'],
  },
  {
    slug: 'tactile-mechanical-keyboard',
    name: 'Tactile Mechanical Keyboard',
    tagline: 'Hot-swappable switches, aluminium frame',
    description:
      'A 75% layout keyboard with a CNC-machined aluminium case, gasket-mounted plate, and hot-swappable tactile switches. Connects over Bluetooth, 2.4 GHz, or USB-C.',
    priceCents: 14900,
    stock: 9,
    category: 'workspace',
    icon: 'keyboard',
    palette: ['#ECEFF3', '#C9D1DC', '#27313F'],
  },
  {
    slug: 'glide-wireless-mouse',
    name: 'Glide Wireless Mouse',
    tagline: 'Ergonomic shape, silent clicks',
    description:
      'Sculpted to support a natural hand position, Glide has silent switches, a precision 4000 DPI sensor, and a battery that lasts three months between charges.',
    priceCents: 4900,
    stock: 30,
    category: 'workspace',
    icon: 'mouse',
    palette: ['#E9F5FF', '#B5DCFF', '#0F4C81'],
  },
  {
    slug: 'linen-notebook-set',
    name: 'Linen Notebook Set',
    tagline: 'Three A5 notebooks with dotted pages',
    description:
      'Lay-flat binding, 120 gsm paper that resists bleed-through, and linen covers in sage, sand, and slate. Each notebook has 160 numbered, dotted pages.',
    priceCents: 2800,
    stock: 45,
    category: 'workspace',
    icon: 'notebook-pen',
    palette: ['#EEF4EA', '#C9DDBE', '#3B5A2C'],
  },

  // Home
  {
    slug: 'nordic-lounge-chair',
    name: 'Nordic Lounge Chair',
    tagline: 'Solid oak frame with bouclé upholstery',
    description:
      'A low-slung lounge chair built from FSC-certified solid oak and wrapped in soft bouclé. Designed for slow mornings and long reads.',
    priceCents: 42000,
    stock: 4,
    featured: true,
    category: 'home',
    icon: 'armchair',
    palette: ['#F6EFE7', '#E3CDB5', '#6B4423'],
  },
  {
    slug: 'halo-floor-lamp',
    name: 'Halo Floor Lamp',
    tagline: 'Soft ambient glow with a linen shade',
    description:
      'Halo casts a warm, diffused light through a hand-pleated linen shade. A foot switch and a weighted marble base make it practical as well as beautiful.',
    priceCents: 15900,
    stock: 7,
    category: 'home',
    icon: 'lamp',
    palette: ['#FDF3E7', '#F5D3A8', '#80501A'],
  },
  {
    slug: 'terra-plant-pot',
    name: 'Terra Ceramic Planter',
    tagline: 'Hand-glazed stoneware with drainage tray',
    description:
      'Each Terra planter is thrown and glazed by hand, so no two are quite alike. Sized for medium houseplants and finished with a matching drainage tray.',
    priceCents: 3600,
    stock: 25,
    category: 'home',
    icon: 'sprout',
    palette: ['#EAF6EC', '#BFE3C6', '#1F6131'],
  },
  {
    slug: 'cloud-throw-blanket',
    name: 'Cloud Knit Throw',
    tagline: 'Chunky knit, 100% organic cotton',
    description:
      'An oversized throw knitted from organic cotton yarn that softens with every wash. Generous enough to share on the sofa.',
    priceCents: 8900,
    stock: 12,
    category: 'home',
    icon: 'sofa',
    palette: ['#F3EEF8', '#DCCDEB', '#55387A'],
  },

  // Kitchen
  {
    slug: 'ember-pour-over-set',
    name: 'Ember Pour-Over Coffee Set',
    tagline: 'Glass carafe, ceramic dripper, two cups',
    description:
      'Everything you need for a slow, perfect brew. The heat-resistant glass carafe holds 600 ml, and the ceramic dripper fits standard #2 filters.',
    priceCents: 5900,
    stock: 16,
    featured: true,
    category: 'kitchen',
    icon: 'coffee',
    palette: ['#F7EDE6', '#E8C8B0', '#6A3517'],
  },
  {
    slug: 'atlas-chef-knife',
    name: 'Atlas Chef’s Knife',
    tagline: '8-inch Damascus steel with walnut handle',
    description:
      'Sixty-seven layers of Damascus steel folded around a VG-10 core and hand-sharpened to a 15° edge. Balanced, razor sharp, and built to last a lifetime.',
    priceCents: 11900,
    stock: 6,
    category: 'kitchen',
    icon: 'utensils',
    palette: ['#EDF1F2', '#CAD5D8', '#2C4248'],
  },
  {
    slug: 'harvest-cutting-board',
    name: 'Harvest Cutting Board',
    tagline: 'End-grain acacia, juice groove',
    description:
      'End-grain construction is gentle on knife edges and naturally self-healing. Finished with food-safe oil and fitted with non-slip feet.',
    priceCents: 4400,
    stock: 20,
    category: 'kitchen',
    icon: 'salad',
    palette: ['#F4F2E4', '#E0DBB0', '#5A5418'],
  },
  {
    slug: 'still-water-bottle',
    name: 'Still Insulated Bottle',
    tagline: 'Keeps drinks cold for 24 hours',
    description:
      'Double-wall vacuum insulated stainless steel with a leak-proof bamboo lid. Holds 750 ml and fits most cup holders.',
    priceCents: 3200,
    stock: 2,
    category: 'kitchen',
    icon: 'cup-soda',
    palette: ['#E6F4FA', '#AFDCEF', '#0D5873'],
  },

  // Apparel
  {
    slug: 'everyday-oxford-shirt',
    name: 'Everyday Oxford Shirt',
    tagline: 'Garment-washed organic cotton',
    description:
      'A relaxed oxford shirt that looks just as good tucked in as it does open over a tee. Garment-washed for softness right out of the box.',
    priceCents: 6800,
    stock: 28,
    category: 'apparel',
    icon: 'shirt',
    palette: ['#EAF0FA', '#C3D3EF', '#203F75'],
  },
  {
    slug: 'summit-trail-sneakers',
    name: 'Summit Trail Sneakers',
    tagline: 'Recycled knit upper, grippy outsole',
    description:
      'Lightweight sneakers with a breathable recycled knit upper, cushioned midsole, and a lugged outsole that handles city streets and gravel paths alike.',
    priceCents: 12500,
    stock: 11,
    featured: true,
    category: 'apparel',
    icon: 'footprints',
    palette: ['#FFEDEA', '#FFC2B8', '#8C2A1B'],
  },
  {
    slug: 'meridian-sunglasses',
    name: 'Meridian Sunglasses',
    tagline: 'Polarised lenses, acetate frames',
    description:
      'Classic round frames cut from plant-based acetate with polarised, UV400 lenses. Comes with a vegan leather case and a cleaning cloth.',
    priceCents: 8500,
    stock: 15,
    category: 'apparel',
    icon: 'glasses',
    palette: ['#F2F0EA', '#DAD4C2', '#45402F'],
  },
  {
    slug: 'arc-minimal-watch',
    name: 'Arc Minimal Watch',
    tagline: 'Sapphire crystal, Italian leather strap',
    description:
      'A clean 38 mm dial, Japanese quartz movement, scratch-resistant sapphire crystal, and a quick-release strap in vegetable-tanned Italian leather.',
    priceCents: 19500,
    stock: 5,
    category: 'apparel',
    icon: 'watch',
    palette: ['#F4EEE8', '#E2D1BF', '#5C3B1E'],
  },

  // Outdoors
  {
    slug: 'trailhead-daypack',
    name: 'Trailhead Daypack',
    tagline: '24 L, weatherproof, padded laptop sleeve',
    description:
      'A versatile daypack made from recycled, weatherproof nylon. A padded sleeve fits a 16-inch laptop and the ventilated back panel keeps you cool on the trail.',
    priceCents: 9800,
    stock: 13,
    featured: true,
    category: 'outdoors',
    icon: 'backpack',
    palette: ['#E9F3EC', '#BCDCC6', '#21523A'],
  },
  {
    slug: 'canopy-travel-umbrella',
    name: 'Canopy Travel Umbrella',
    tagline: 'Wind-resistant, auto open and close',
    description:
      'A compact umbrella with a vented double canopy that stands up to 60 mph gusts. Opens and closes with one button and packs down to 28 cm.',
    priceCents: 3900,
    stock: 19,
    category: 'outdoors',
    icon: 'umbrella',
    palette: ['#EEF0FB', '#C8CEF2', '#2E3A85'],
  },
  {
    slug: 'basecamp-lantern',
    name: 'Basecamp Lantern',
    tagline: 'Rechargeable, 500 lumens, power bank',
    description:
      'A rugged camping lantern with four brightness levels, a red night-vision mode, and a battery that doubles as a power bank for your phone.',
    priceCents: 5400,
    stock: 8,
    category: 'outdoors',
    icon: 'flashlight',
    palette: ['#FFF6E0', '#FFDE91', '#7A4F00'],
  },
  {
    slug: 'vista-compact-camera',
    name: 'Vista Compact Camera',
    tagline: '24 MP sensor, weather sealed',
    description:
      'Take Vista anywhere: it is weather sealed, fits in a jacket pocket, and shoots sharp 24 MP stills and 4K video through a bright f/1.8 lens.',
    priceCents: 64900,
    stock: 3,
    category: 'outdoors',
    icon: 'camera',
    palette: ['#EDEDF0', '#CFCFD8', '#2B2B3A'],
  },
];
