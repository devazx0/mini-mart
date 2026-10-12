import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main(): Promise<void> {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const email = (process.env["ADMIN_EMAIL"] ?? "admin@minimart.local").toLowerCase().trim();
    const password = process.env["ADMIN_PASSWORD"] ?? "Admin123!";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`seed: admin already exists (${email})`);
      return;
    }
    const hash = await argon2.hash(password);
    await prisma.user.create({
      data: {
        firstName: "Site",
        lastName: "Admin",
        email,
        password: hash,
        dob: new Date("1990-01-01"),
        role: "admin",
      },
    });
    console.log(`seed: admin created (${email})`);
  } finally {
    // fall through to product seeding with a fresh client below
  }

  const prisma2 = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const products = [
      {
        name: "Premium Wireless ANC Headphones",
        description: "Over-ear active noise cancellation, 40h battery.",
        price: 45000,
        oldPrice: 52000,
        stock: 18,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCs0hnBzyfeCyk2Iw1QIqwtAeY9EPdCUG5ipRrciozCABnTfLgMkF6n-30wFvuP7es2jUeHI1YajSZSg-aC64Diw4edbyZ29rLaoLaXjwJrqs-HIdCKK0oqnO-wXQg6CJPGSkIyD_iRI-leljwFVXO4KSBt_OVx-hdMo5hDarKiD3vugSR6c0twUlBcmFa3dMSf-2zygmtAb89_XeZvGW03Xlhl6Tez2xH5rphRmhY",
        category: "Audio",
        categorySlug: "audio",
        rating: 4.9,
        reviewCount: 142,
        freeDelivery: true,
        badge: "-13% OFF",
        storeName: "TechHub NG",
        storeLocation: "Lagos State",
        verified: true,
      },
      {
        name: "Mechanical Keyboard Hot-Swappable RGB",
        description: "Gateron Brown switches, compact layout.",
        price: 38500,
        stock: 3,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkrpdfkWVeC99DJQj8iWPgdy_Qd_Yn06EuOqBb3eoqfCMiyH3a93pj-ysSGYBhlK0Xbad3Z-jzwCOCu-3w2fBYUpJvCMHrBjEiK02hOiDA8vV4E-ZZj-K6UvrsOZcNHi9F_iGm9y58kGtd59xvx1OiP985B3iL1XXg7kvYU-TWnSXuY_xpB-ajqmOc-i_XWH7m8LlLJdyQm4blS3Zum2ZNcXE6bBnQ9SwGXipeTkw",
        category: "Computing",
        categorySlug: "computing",
        rating: 4.8,
        reviewCount: 89,
        freeDelivery: false,
        badge: "Fast Selling",
        storeName: "Adebayo Stores",
        storeLocation: "Ibadan",
        verified: true,
      },
      {
        name: "Minimalist Aluminum Laptop Riser",
        description: "Ergonomic foldable with carry pouch.",
        price: 28000,
        stock: 24,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBBxxGqUdEVSY91zRmmiGcz9OwSM7cm40nqpADD4P1aIcVgMAVGfs70qrUiR5lR2MxaLE5uNAXai5FH-TI4wzQJZYqbZmi-OiJa9Xno23X5sM04meTQqYClTKIG_6icWaAP64xaymXgPfirygzXFdz1LmjFJF_E9fZWepkIeQbvA1zaB3WlXqRAHApvFZVyX57W2Ehapon6oOy7sodkrqDnLKy-jyVlz45Vp-3YuWw",
        category: "Home Office",
        categorySlug: "home-office",
        rating: 4.9,
        reviewCount: 210,
        freeDelivery: false,
        badge: "Top Seller 2024",
        storeName: "Urban Essentials",
        storeLocation: "Abuja",
        verified: false,
      },
      {
        name: "65W GaN Dual USB-C Fast Charger",
        description: "PD 3.0 / QC 4+, includes braided cable.",
        price: 16500,
        stock: 41,
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBOdR_gp4ADf4VhKaTlezPqmhuJcycZHGaN9GcbZLFinufz1SVJ2zfIWe1boMP28Ovs10fmFv8a1PxE5hKaST6EFu2aqi17v7FhmLIPmdw-c4ET8-DxsOy9YgmyvGRJyZuy9h3BjazH52JH2fA8IUy-Z6aFtHLt8xJJ5atyLcEczPXDA_7GCLi4Dc3QiflhdqTwBE86uK33MV4JWtecWegdOkRvwB0_XF7vJH2-Mno",
        category: "Accessories",
        categorySlug: "accessories",
        rating: 4.7,
        reviewCount: 64,
        freeDelivery: false,
        badge: null,
        storeName: "Nova Gadgets",
        storeLocation: "Port Harcourt",
        verified: true,
      },
    ];
    for (const p of products) {
      const existing = await prisma2.product.findFirst({ where: { name: p.name } });
      if (!existing) {
        await prisma2.product.create({ data: p });
        console.log(`seed: product created (${p.name})`);
      }
    }
  } finally {
    await prisma2.$disconnect();
  }
}

void main();
