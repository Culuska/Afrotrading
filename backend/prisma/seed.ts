import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AfroTrading database...");

  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@afrotrading.com" },
    update: {},
    create: {
      fullName: "AfroTrading Admin",
      email: "admin@afrotrading.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      membership: "VIP_LIFETIME",
      status: "ACTIVE",
      emailVerified: true,
      country: "Somalia",
    },
  });

  const demoPasswordHash = await bcrypt.hash("Demo@12345", 12);
  await prisma.user.upsert({
    where: { email: "demo@afrotrading.com" },
    update: {},
    create: {
      fullName: "Demo Trader",
      email: "demo@afrotrading.com",
      passwordHash: demoPasswordHash,
      role: "VIP",
      membership: "VIP_MONTHLY",
      status: "ACTIVE",
      emailVerified: true,
      country: "Kenya",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      seoTitle: "AfroTrading — Premium Gold (XAUUSD) Trading Signals",
      seoDescription: "Professional gold trading signals, market analysis and education. Join our VIP Telegram community for daily XAUUSD signals.",
      heroTitle: "Trade Gold Like a Pro",
      heroSubtitle: "Premium XAUUSD signals, real-time analysis, and a community of serious traders.",
      telegramGroupUrl: process.env.TELEGRAM_GROUP_URL || "https://t.me/afrotrading_community",
      telegramChannelUrl: process.env.TELEGRAM_CHANNEL_URL || "https://t.me/afrotrading_vip",
      whatsappNumber: "+252611234567",
      contactEmail: "support@afrotrading.com",
      contactPhone: "+252611234567",
    },
  });

  const pricingPlans = [
    {
      name: "Free",
      slug: "free",
      price: 0,
      billingCycle: "free",
      order: 1,
      features: [
        "3 signals per week",
        "Delayed signal alerts",
        "Basic education content",
        "Community Telegram group",
      ],
    },
    {
      name: "VIP Monthly",
      slug: "vip-monthly",
      price: 49,
      billingCycle: "month",
      order: 2,
      isPopular: true,
      features: [
        "Unlimited daily signals",
        "Instant Telegram alerts",
        "Premium education library",
        "Daily market analysis",
        "Priority support",
      ],
    },
    {
      name: "VIP Lifetime",
      slug: "vip-lifetime",
      price: 399,
      billingCycle: "lifetime",
      order: 3,
      features: [
        "Everything in VIP Monthly",
        "Lifetime access, pay once",
        "1-on-1 onboarding call",
        "Early access to new tools",
      ],
    },
  ];

  for (const plan of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  const signalSeed = [
    { direction: "BUY" as const, entryPrice: 2385.5, stopLoss: 2378.0, takeProfit1: 2392.0, takeProfit2: 2398.0, takeProfit3: 2405.0, status: "HIT_TP2" as const, resultPips: 125, riskReward: 2.5, profitUsd: 250, notes: "Bullish engulfing off key support, FOMC tailwind." },
    { direction: "SELL" as const, entryPrice: 2410.0, stopLoss: 2417.0, takeProfit1: 2402.0, takeProfit2: 2396.0, takeProfit3: null, status: "STOPPED_OUT" as const, resultPips: -70, riskReward: -1, profitUsd: -140, notes: "Rejected at resistance, invalidated by strong USD data." },
    { direction: "BUY" as const, entryPrice: 2350.0, stopLoss: 2343.0, takeProfit1: 2357.0, takeProfit2: 2364.0, takeProfit3: 2371.0, status: "RUNNING" as const, notes: "Trend continuation after retest of broken resistance." },
    { direction: "SELL" as const, entryPrice: 2425.0, stopLoss: 2431.0, takeProfit1: 2418.0, takeProfit2: 2412.0, takeProfit3: null, status: "PENDING" as const, notes: "Waiting for confirmation candle at daily resistance." },
    { direction: "BUY" as const, entryPrice: 2340.0, stopLoss: 2333.0, takeProfit1: 2347.0, takeProfit2: 2354.0, takeProfit3: 2361.0, status: "HIT_TP3" as const, resultPips: 210, riskReward: 3, profitUsd: 420, notes: "Textbook breakout retest, full TP3 target reached." },
  ];

  for (const s of signalSeed) {
    await prisma.signal.create({
      data: {
        ...s,
        pair: "XAUUSD",
        riskPercent: 1,
        isPublished: true,
        publishedAt: new Date(),
        telegramSent: false,
      },
    });
  }

  const educationSeed = [
    { title: "Understanding Gold Market Fundamentals", category: "GOLD_ANALYSIS" as const, type: "ARTICLE" as const, description: "Learn the macro drivers behind XAUUSD price action.", featured: true },
    { title: "Risk Management for Gold Traders", category: "RISK_MANAGEMENT" as const, type: "VIDEO" as const, description: "Position sizing and stop-loss placement strategies.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Trading Psychology: Mastering Discipline", category: "TRADING_PSYCHOLOGY" as const, type: "ARTICLE" as const, description: "How to control emotions during high-volatility gold sessions." },
    { title: "Weekly Gold Outlook Template", category: "WEEKLY_ANALYSIS" as const, type: "PDF" as const, description: "Downloadable weekly bias planning worksheet.", vipOnly: true },
  ];

  for (const e of educationSeed) {
    const slug = e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.educationContent.upsert({
      where: { slug },
      update: {},
      create: { ...e, slug, published: true },
    });
  }

  const analysisSeed = [
    { title: "Daily Gold Technical Outlook", timeframe: "DAILY" as const, type: "TECHNICAL" as const, summary: "Key intraday support/resistance levels for XAUUSD." },
    { title: "Weekly Fundamental Review: Fed Policy & Gold", timeframe: "WEEKLY" as const, type: "FUNDAMENTAL" as const, summary: "How this week's Fed commentary is shaping gold sentiment." },
    { title: "Monthly Macro Outlook for Gold", timeframe: "MONTHLY" as const, type: "FUNDAMENTAL" as const, summary: "Central bank policy, inflation data, and gold's long-term trend." },
  ];

  for (const a of analysisSeed) {
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.marketAnalysis.upsert({
      where: { slug },
      update: {},
      create: { ...a, slug, published: true },
    });
  }

  const testimonials = [
    { name: "Ahmed K.", country: "Somalia", message: "AfroTrading's signals have transformed my trading discipline. Consistent and transparent results.", rating: 5 },
    { name: "Fatima A.", country: "Kenya", message: "The education center taught me more in a month than years of trial and error.", rating: 5 },
    { name: "James M.", country: "Nigeria", message: "VIP signals hit TP2 almost every week. Best gold signal service I've used.", rating: 5 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log("Seed complete. Admin login: admin@afrotrading.com / Admin@12345");
  console.log(`Admin ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
