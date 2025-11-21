import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleCategories = [
  { name: "Controllers", slug: "controllers", description: "Gaming controllers and joysticks" },
  { name: "Keyboards", slug: "keyboards", description: "Mechanical and gaming keyboards" },
  { name: "Mice", slug: "mice", description: "Gaming mice and accessories" },
  { name: "Headsets", slug: "headsets", description: "Gaming headsets and audio equipment" },
  { name: "Accessories", slug: "accessories", description: "Gaming accessories and peripherals" },
];

const sampleProducts = [
  {
    name: "Pro Gaming Controller X1",
    slug: "pro-gaming-controller-x1",
    description: "Professional-grade wireless gaming controller with customizable buttons, RGB lighting, and 40-hour battery life. Perfect for competitive gaming.",
    price: 7999, // $79.99
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800",
    stock: 50,
    featured: true,
  },
  {
    name: "Elite Mechanical Keyboard RGB",
    slug: "elite-mechanical-keyboard-rgb",
    description: "Full-size mechanical keyboard with Cherry MX switches, per-key RGB lighting, and aluminum frame. Built for gamers and professionals.",
    price: 12999, // $129.99
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    stock: 35,
    featured: true,
  },
  {
    name: "Precision Gaming Mouse Pro",
    slug: "precision-gaming-mouse-pro",
    description: "High-precision optical gaming mouse with 16000 DPI, 8 programmable buttons, and ergonomic design for extended gaming sessions.",
    price: 5999, // $59.99
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
    stock: 75,
    featured: true,
  },
  {
    name: "Surround Sound Gaming Headset",
    slug: "surround-sound-gaming-headset",
    description: "7.1 surround sound gaming headset with noise-cancelling microphone, memory foam ear cushions, and multi-platform compatibility.",
    price: 8999, // $89.99
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=800",
    stock: 60,
    featured: true,
  },
  {
    name: "Classic Arcade Joystick",
    slug: "classic-arcade-joystick",
    description: "Retro-style arcade joystick with authentic Sanwa parts. Compatible with PC, PlayStation, and Nintendo Switch.",
    price: 9999, // $99.99
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    stock: 25,
    featured: false,
  },
  {
    name: "Compact TKL Keyboard",
    slug: "compact-tkl-keyboard",
    description: "Tenkeyless mechanical keyboard with hot-swappable switches and customizable RGB backlighting. Perfect for minimalist setups.",
    price: 8999, // $89.99
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
    stock: 40,
    featured: false,
  },
  {
    name: "Wireless Gaming Mouse",
    slug: "wireless-gaming-mouse",
    description: "Lightweight wireless gaming mouse with 20000 DPI sensor and 70-hour battery life. Ultra-responsive for competitive play.",
    price: 6999, // $69.99
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800",
    stock: 55,
    featured: true,
  },
  {
    name: "Wireless Gaming Headset Pro",
    slug: "wireless-gaming-headset-pro",
    description: "Premium wireless gaming headset with 50mm drivers, 30-hour battery, and lossless 2.4GHz connection.",
    price: 14999, // $149.99
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    stock: 30,
    featured: false,
  },
  {
    name: "RGB Mouse Pad XL",
    slug: "rgb-mouse-pad-xl",
    description: "Extra-large RGB gaming mouse pad with non-slip rubber base and smooth surface for precise mouse control.",
    price: 2999, // $29.99
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
    stock: 100,
    featured: false,
  },
  {
    name: "Controller Charging Dock",
    slug: "controller-charging-dock",
    description: "Dual controller charging station with LED indicators. Compatible with Xbox and PlayStation controllers.",
    price: 3499, // $34.99
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800",
    stock: 80,
    featured: false,
  },
  {
    name: "Gaming Chair Armrest Pads",
    slug: "gaming-chair-armrest-pads",
    description: "Memory foam armrest cushions for gaming chairs. Reduces elbow and forearm strain during long gaming sessions.",
    price: 1999, // $19.99
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800",
    stock: 120,
    featured: false,
  },
  {
    name: "Flight Simulator Joystick",
    slug: "flight-simulator-joystick",
    description: "Professional flight simulator joystick with throttle control, multiple programmable buttons, and realistic force feedback.",
    price: 19999, // $199.99
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800",
    stock: 15,
    featured: true,
  },
];

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Insert categories
    console.log("Inserting categories...");
    for (const category of sampleCategories) {
      await db.insert(categories).values(category);
    }
    
    // Insert products
    console.log("Inserting products...");
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }
    
    console.log("✓ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
