const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_CHAT_ID = process.env.TELEGRAM_CHANNEL_CHAT_ID;

const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

async function callTelegramApi(method: string, body: Record<string, unknown>): Promise<any> {
  if (!API_BASE) {
    console.warn("TELEGRAM_BOT_TOKEN is not set; skipping Telegram API call. Set it in Railway → Variables.");
    return null;
  }
  if (!body.chat_id) {
    console.warn("TELEGRAM_CHANNEL_CHAT_ID is not set; skipping Telegram API call. Set it in Railway → Variables.");
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Telegram API error (${method}):`, data);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`Telegram API request failed (${method}):`, err);
    return null;
  }
}

export async function sendTelegramMessage(text: string, chatId?: string) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId || CHANNEL_CHAT_ID,
    text,
    parse_mode: "HTML",
  });
}

export async function editTelegramMessage(text: string, messageId: number, chatId?: string) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId || CHANNEL_CHAT_ID,
    message_id: messageId,
    text,
    parse_mode: "HTML",
  });
}

export function formatSignalMessage(signal: {
  signalNumber: number;
  pair: string;
  direction: string;
  entryPrice: unknown;
  stopLoss: unknown;
  takeProfit1: unknown;
  takeProfit2?: unknown;
  takeProfit3?: unknown;
  notes?: string | null;
}) {
  const arrow = signal.direction === "BUY" ? "🟢 BUY" : "🔴 SELL";
  const lines = [
    `<b>AfroTrading Signal #${signal.signalNumber}</b>`,
    `${arrow} ${signal.pair}`,
    ``,
    `Entry: <b>${signal.entryPrice}</b>`,
    `Stop Loss: <b>${signal.stopLoss}</b>`,
    `TP1: <b>${signal.takeProfit1}</b>`,
    signal.takeProfit2 ? `TP2: <b>${signal.takeProfit2}</b>` : null,
    signal.takeProfit3 ? `TP3: <b>${signal.takeProfit3}</b>` : null,
    signal.notes ? `\nNotes: ${signal.notes}` : null,
    `\n⚠️ Manage your risk: don't risk more than 1-2%. Always protect your capital.`,
  ].filter(Boolean);
  return lines.join("\n");
}

export async function generateInviteLink(chatId: string) {
  return callTelegramApi("createChatInviteLink", {
    chat_id: chatId,
    member_limit: 1,
  });
}
