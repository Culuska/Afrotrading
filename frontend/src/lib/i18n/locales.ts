export const LOCALES = ["en", "ar", "so"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_INFO: Record<Locale, { label: string; nativeLabel: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  so: { label: "Somali", nativeLabel: "Soomaali", dir: "ltr" },
};

export const DEFAULT_LOCALE: Locale = "en";
