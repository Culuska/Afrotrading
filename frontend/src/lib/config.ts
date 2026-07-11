export const TELEGRAM_GROUP_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || "https://t.me/afrotrading_community";

// Digits only (no "+" or spaces) — required format for wa.me links.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "252615901901";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_PHONE_DISPLAY = process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || "+252 61 590 1901";
export const CONTACT_PHONE_TEL = `tel:+${WHATSAPP_NUMBER}`;
