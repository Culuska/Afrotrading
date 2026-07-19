"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bitcoin, Smartphone, Loader2, Upload } from "lucide-react";

import { api, uploadFile, ApiError } from "@/lib/api";
import { CONTACT_PHONE_DISPLAY } from "@/lib/config";
import type { Membership } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PayMethod = "choose" | "crypto" | "mobile";

export function CheckoutDialog({
  open,
  onOpenChange,
  plan,
  planLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Extract<Membership, "VIP_MONTHLY" | "VIP_LIFETIME">;
  planLabel: string;
}) {
  const [method, setMethod] = useState<PayMethod>("choose");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ mobileNumber: "", transactionRef: "", proofImageUrl: "" });
  const router = useRouter();

  function reset(next: boolean) {
    if (!next) {
      setMethod("choose");
      setSubmitted(false);
      setForm({ mobileNumber: "", transactionRef: "", proofImageUrl: "" });
    }
    onOpenChange(next);
  }

  async function payWithCrypto() {
    setLoading(true);
    try {
      const { invoiceUrl } = await api.post<{ invoiceUrl: string }>("/api/payments/crypto/create", { plan });
      window.location.href = invoiceUrl;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start crypto checkout");
      setLoading(false);
    }
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { asset } = await uploadFile<{ asset: { url: string } }>("/api/upload", file, "payment-proof");
      setForm((f) => ({ ...f, proofImageUrl: asset.url }));
      toast.success("Proof uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload proof");
    } finally {
      setUploading(false);
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/payments/manual/submit", { plan, ...form });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to {planLabel}</DialogTitle>
        </DialogHeader>

        {method === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMethod("crypto")}
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4 text-left transition-colors hover:border-gold-500/50"
            >
              <Bitcoin className="h-5 w-5 text-gold-400" />
              <div>
                <p className="font-medium">Pay with Crypto</p>
                <p className="text-xs text-foreground/50">Instant — BTC, USDT, and more</p>
              </div>
            </button>
            <button
              onClick={() => setMethod("mobile")}
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4 text-left transition-colors hover:border-gold-500/50"
            >
              <Smartphone className="h-5 w-5 text-gold-400" />
              <div>
                <p className="font-medium">Pay with EVC Plus / Zaad</p>
                <p className="text-xs text-foreground/50">Manual — verified within 24 hours</p>
              </div>
            </button>
          </div>
        )}

        {method === "crypto" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">
              You&apos;ll be redirected to a secure crypto checkout to complete your payment. Your membership
              activates automatically once the payment confirms on the blockchain.
            </p>
            <Button className="w-full" onClick={payWithCrypto} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bitcoin className="h-4 w-4" />}
              Continue to Crypto Checkout
            </Button>
            <button className="text-xs text-foreground/40 underline" onClick={() => setMethod("choose")}>
              Back
            </button>
          </div>
        )}

        {method === "mobile" && !submitted && (
          <form className="space-y-4" onSubmit={submitManual}>
            <p className="text-sm text-foreground/60">
              Send payment to our EVC Plus / Zaad number: <span className="font-semibold text-gold-400" dir="ltr">{CONTACT_PHONE_DISPLAY}</span>.
              Then fill in the details below so we can verify it.
            </p>
            <div className="space-y-2">
              <Label>Your Mobile Number Used</Label>
              <Input
                required
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference / ID</Label>
              <Input
                required
                value={form.transactionRef}
                onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Proof of Payment (optional)</Label>
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <label className="w-full cursor-pointer justify-center">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Screenshot
                  <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} disabled={uploading} />
                </label>
              </Button>
              {form.proofImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.proofImageUrl} alt="Proof" className="mt-2 max-h-32 rounded-lg border border-black/10" />
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
            <button type="button" className="text-xs text-foreground/40 underline" onClick={() => setMethod("choose")}>
              Back
            </button>
          </form>
        )}

        {submitted && (
          <div className="space-y-4 text-center">
            <p className="text-foreground/70">
              Your payment has been submitted for review. We&apos;ll confirm your membership within 24 hours and
              notify you by email.
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
