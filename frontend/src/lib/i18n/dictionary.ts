export interface Dictionary {
  nav: {
    links: { signals: string; signalHistory: string; education: string; marketAnalysis: string; pricing: string; about: string; support: string };
    telegram: string;
    logIn: string;
    getStarted: string;
    dashboard: string;
    adminPanel: string;
    logOut: string;
  };
  footer: {
    tagline: string;
    platformHeading: string;
    companyHeading: string;
    accountHeading: string;
    contactHeading: string;
    platformLinks: { liveSignals: string; signalHistory: string; marketAnalysis: string; educationCenter: string };
    companyLinks: { aboutUs: string; pricing: string; support: string; riskDisclaimer: string };
    accountLinks: { createAccount: string; logIn: string; dashboard: string };
    riskDisclaimerLabel: string;
    riskDisclaimerText: string;
    copyright: string;
    tagline2: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    getStartedFree: string;
    joinTelegram: string;
    verifiedTrackRecord: string;
    tradersCount: string;
  };
  home: {
    stats: { eyebrow: string; title: string; description: string; winRate: string; totalSignals: string; profitFactor: string; avgRiskReward: string };
    signals: { eyebrow: string; title: string; description: string; viewAll: string };
    education: { eyebrow: string; title: string; description: string; exploreAll: string };
    marketAnalysis: { eyebrow: string; title: string; description: string; viewAll: string };
    testimonials: { eyebrow: string; title: string };
    cta: { title: string; description: string; createAccount: string; joinTelegram: string };
  };
  pricing: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    mostPopular: string;
    startFree: string;
    signUpToUpgrade: string;
    choosePlan: string;
    once: string;
    faqTitle: string;
  };
  about: {
    titleLine1: string;
    titleLine2: string;
    intro: string;
    mission: { title: string; body: string };
    vision: { title: string; body: string };
    philosophy: { title: string; body: string };
    riskDisclaimerTitle: string;
    riskDisclaimerP1: string;
    riskDisclaimerP2: string;
  };
  contact: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    telegram: string;
    whatsapp: string;
    email: string;
    phone: string;
    fullName: string;
    emailLabel: string;
    phoneOptional: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    sentSuccess: string;
    sentError: string;
    faqTitle: string;
  };
  faq: { question: string; answer: string }[];
}
