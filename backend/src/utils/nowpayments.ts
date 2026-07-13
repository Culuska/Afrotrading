import crypto from "crypto";

const API_BASE = "https://api.nowpayments.io/v1";
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

interface CreateInvoiceParams {
  priceAmount: number;
  orderId: string;
  orderDescription: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createInvoice(params: CreateInvoiceParams) {
  if (!API_KEY) {
    console.warn("NOWPAYMENTS_API_KEY not configured; cannot create invoice.");
    return null;
  }
  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: "usd",
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/nowpayments/webhook`,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  });
  if (!res.ok) {
    console.error("NowPayments createInvoice failed:", await res.text());
    return null;
  }
  return res.json() as Promise<{ id: string; invoice_url: string }>;
}

/** Recursively sorts object keys — NowPayments signs a canonical (key-sorted) JSON string. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function verifyIpnSignature(body: unknown, signature: string | undefined): boolean {
  if (!IPN_SECRET || !signature) return false;
  const sortedBody = JSON.stringify(sortKeys(body));
  const expected = crypto.createHmac("sha512", IPN_SECRET).update(sortedBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
