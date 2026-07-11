export type Role = "FREE" | "VIP" | "ADMIN";
export type Membership = "FREE" | "VIP_MONTHLY" | "VIP_LIFETIME";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  role: Role;
  membership: Membership;
  membershipExpiresAt?: string | null;
  status: UserStatus;
  emailVerified: boolean;
  telegramJoined: boolean;
  telegramUsername?: string | null;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  notifyPush: boolean;
  referralCode: string;
  createdAt: string;
}

export type SignalDirection = "BUY" | "SELL";
export type SignalStatus =
  | "PENDING"
  | "RUNNING"
  | "HIT_TP1"
  | "HIT_TP2"
  | "HIT_TP3"
  | "STOPPED_OUT"
  | "CLOSED"
  | "CANCELLED";

export interface Signal {
  id: string;
  signalNumber: number;
  pair: string;
  direction: SignalDirection;
  entryPrice: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2?: string | null;
  takeProfit3?: string | null;
  riskPercent?: string | null;
  status: SignalStatus;
  resultPips?: string | null;
  riskReward?: string | null;
  profitUsd?: string | null;
  chartImageUrl?: string | null;
  notes?: string | null;
  isPublished: boolean;
  isArchived: boolean;
  vipOnly: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
}

export type EducationType = "VIDEO" | "PDF" | "IMAGE" | "ARTICLE";
export type EducationCategory =
  | "MARKET_ANALYSIS"
  | "TRADING_PSYCHOLOGY"
  | "RISK_MANAGEMENT"
  | "GOLD_ANALYSIS"
  | "FOREX_EDUCATION"
  | "VIDEO_LESSONS"
  | "ARTICLES"
  | "WEEKLY_ANALYSIS"
  | "TRADING_JOURNAL";

export interface EducationContent {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: EducationType;
  category: EducationCategory;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  fileUrl?: string | null;
  imageUrl?: string | null;
  body?: string | null;
  featured: boolean;
  vipOnly: boolean;
  published: boolean;
  createdAt: string;
}

export type AnalysisTimeframe = "DAILY" | "WEEKLY" | "MONTHLY";
export type AnalysisType = "TECHNICAL" | "FUNDAMENTAL";

export interface MarketAnalysis {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  body?: string | null;
  timeframe: AnalysisTimeframe;
  type: AnalysisType;
  pair: string;
  chartImageUrl?: string | null;
  videoUrl?: string | null;
  vipOnly: boolean;
  published: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country?: string | null;
  avatarUrl?: string | null;
  message: string;
  rating: number;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  price: string;
  billingCycle: string;
  features: string[];
  isPopular: boolean;
  order: number;
}

export interface PerformanceStats {
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  runningSignals: number;
  pendingSignals: number;
  winRate: number;
  profitFactor: number;
  averageRiskReward: number;
  monthlyProfit: number;
  weeklyProfit: number;
  bestTrade: { profitUsd?: string | null } | null;
  worstTrade: { profitUsd?: string | null } | null;
}

export interface SiteSettings {
  logoUrl?: string | null;
  heroBannerUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  telegramGroupUrl?: string | null;
  telegramChannelUrl?: string | null;
  whatsappNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}
