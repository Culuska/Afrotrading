"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bitcoin, Smartphone, Loader2, Upload } from "lucide-react";

import { api, uploadFile, ApiError } from "@/lib/api";
import { CONTACT_PHONE_DISPLAY } from "@/lib/config";
import { useI18n } from "@/context/i18n-context";
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
  const { dict } = useI18n();
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
      toast.error(err instanceof ApiError ? err.message : dict.checkout.cryptoCheckoutError);
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
      toast.success(dict.checkout.proofUploadSuccess);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : dict.checkout.proofUploadError);
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
      toast.error(err instanceof ApiError ? err.message : dict.checkout.manualSubmitError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.checkout.upgradeTo} {planLabel}</DialogTitle>
        </DialogHeader>

        {method === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMethod("crypto")}
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4 text-left transition-colors hover:border-gold-500/50"
            >
              <Bitcoin className="h-5 w-5 text-gold-400" />
              <div>
                <p className="font-medium">{dict.checkout.payCrypto}</p>
                <p className="text-xs text-foreground/50">{dict.checkout.payCryptoDesc}</p>
              </div>
            </button>
            <button
              onClick={() => setMethod("mobile")}
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4 text-left transition-colors hover:border-gold-500/50"
            >
              <Smartphone className="h-5 w-5 text-gold-400" />
              <div>
                <p className="font-medium">{dict.checkout.payMobile}</p>
                <p className="text-xs text-foreground/50">{dict.checkout.payMobileDesc}</p>
              </div>
            </button>
          </div>
        )}

        {method === "crypto" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">
              {dict.checkout.cryptoRedirectDesc}
            </p>
            <Button className="w-full" onClick={payWithCrypto} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bitcoin className="h-4 w-4" />}
              {dict.checkout.continueToCrypto}
            </Button>
            <button className="text-xs text-foreground/40 underline" onClick={() => setMethod("choose")}>
              {dict.checkout.back}
            </button>
          </div>
        )}

        {method === "mobile" && !submitted && (
          <form className="space-y-4" onSubmit={submitManual}>
            <p className="text-sm text-foreground/60">
              {dict.checkout.sendPaymentPrefix} <span className="font-semibold text-gold-400" dir="ltr">{CONTACT_PHONE_DISPLAY}</span>.
              {" "}{dict.checkout.sendPaymentSuffix}
            </p>
            <div className="space-y-2">
              <Label>{dict.checkout.yourMobileNumber}</Label>
              <Input
                required
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.checkout.transactionRef}</Label>
              <Input
                required
                value={form.transactionRef}
                onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.checkout.proofOfPayment}</Label>
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <label className="w-full cursor-pointer justify-center">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {dict.checkout.uploadScreenshot}
                  <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} disabled={uploading} />
                </label>
              </Button>
              {form.proofImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.proofImageUrl} alt="Proof" className="mt-2 max-h-32 rounded-lg border border-black/10" />
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? dict.checkout.submitting : dict.checkout.submit}
            </Button>
            <button type="button" className="text-xs text-foreground/40 underline" onClick={() => setMethod("choose")}>
              {dict.checkout.back}
            </button>
          </form>
        )}

        {submitted && (
          <div className="space-y-4 text-center">
            <p className="text-foreground/70">
              {dict.checkout.submittedMessage}
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              {dict.checkout.goToDashboard}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
