export const TELEGRAM_GROUP_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || "https://t.me/afrotrading_community";

export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/afrotrading.signals";
export const X_URL = process.env.NEXT_PUBLIC_X_URL || "https://x.com/Afrotradingfx";
export const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@afrotrading.fx";
export const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/profile.php?id=61591902149337";

// Digits only (no "+" or spaces) — required format for wa.me links.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "252625901900";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_PHONE_DISPLAY = process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || "+252 62 590 1900";
export const CONTACT_PHONE_TEL = `tel:+${WHATSAPP_NUMBER}`;
