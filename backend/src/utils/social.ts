const X_WEBHOOK_URL = process.env.ZAPIER_X_WEBHOOK_URL;
const INSTAGRAM_WEBHOOK_URL = process.env.ZAPIER_INSTAGRAM_WEBHOOK_URL;
const FACEBOOK_WEBHOOK_URL = process.env.ZAPIER_FACEBOOK_WEBHOOK_URL;

const SITE_URL = process.env.FRONTEND_URL || "https://afrotrading-web.vercel.app";

async function postToZapier(url: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Zapier webhook returned ${res.status} for ${url}`);
    }
  } catch (err) {
    console.error(`Zapier webhook request failed for ${url}:`, err);
  }
}

/** Plain-text caption (no HTML) for X and Instagram, kept short enough for X's 280-char limit. */
export function formatSocialCaption(signal: {
  signalNumber: number;
  pair: string;
  direction: string;
  entryPrice: unknown;
  stopLoss: unknown;
  takeProfit1: unknown;
}) {
  const arrow = signal.direction === "BUY" ? "🟢 BUY" : "🔴 SELL";
  return [
    `🥇 New Gold Signal #${signal.signalNumber}`,
    `${arrow} ${signal.pair}`,
    `Entry: ${signal.entryPrice} | SL: ${signal.stopLoss} | TP1: ${signal.takeProfit1}`,
    ``,
    `Free & VIP signals: ${SITE_URL}`,
  ].join("\n");
}

/** Fans a newly published signal out to X and Instagram via Zapier "Catch Hook" webhooks (each a separate Zap). */
export async function broadcastToSocial(signal: {
  signalNumber: number;
  pair: string;
  direction: string;
  entryPrice: unknown;
  stopLoss: unknown;
  takeProfit1: unknown;
  chartImageUrl: string | null;
}) {
  const text = formatSocialCaption(signal);
  const jobs: Promise<void>[] = [];

  if (X_WEBHOOK_URL) {
    jobs.push(postToZapier(X_WEBHOOK_URL, { text, imageUrl: signal.chartImageUrl }));
  }
  if (INSTAGRAM_WEBHOOK_URL && signal.chartImageUrl) {
    // Instagram's API requires an image with every post, so skip signals without one.
    jobs.push(postToZapier(INSTAGRAM_WEBHOOK_URL, { caption: text, imageUrl: signal.chartImageUrl }));
  }
  if (FACEBOOK_WEBHOOK_URL) {
    jobs.push(postToZapier(FACEBOOK_WEBHOOK_URL, { message: text, imageUrl: signal.chartImageUrl }));
  }

  await Promise.all(jobs);
}
