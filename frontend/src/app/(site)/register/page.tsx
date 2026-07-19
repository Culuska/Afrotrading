"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { ApiError } from "@/lib/api";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/country-select";
import { TELEGRAM_GROUP_URL as TELEGRAM_URL } from "@/lib/config";

function RegisterForm() {
  const { register } = useAuth();
  const { dict } = useI18n();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || undefined;
  const [form, setForm] = useState({
    fullName: "",
    country: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error(dict.register.passwordsMismatch);
      return;
    }
    if (!form.agree) {
      toast.error(dict.register.mustAgree);
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        country: form.country,
        phone: form.phone,
        referralCode,
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : dict.register.registrationFailed);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard title={dict.register.successTitle} description={dict.register.successBody}>
        <div className="flex flex-col items-center gap-5 text-center">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <p className="text-sm text-foreground/70">
            {dict.register.verificationMessage}
          </p>
          <Button asChild size="lg" className="w-full">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Send className="h-4 w-4" /> {dict.register.joinTelegram}
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">{dict.register.goToDashboard}</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={dict.register.formTitle} description={dict.register.formSubtitle}>
      {referralCode && (
        <p className="mb-5 rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-2.5 text-center text-sm text-gold-400">
          {dict.register.referralBanner}
        </p>
      )}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">{dict.register.fullName}</Label>
          <Input
            id="fullName"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">{dict.register.country}</Label>
            <CountrySelect value={form.country} onChange={(country) => setForm({ ...form, country })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{dict.register.phone}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{dict.register.email}</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">{dict.register.password}</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{dict.register.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-foreground/70">
          <Checkbox
            className="mt-0.5"
            checked={form.agree}
            onCheckedChange={(v) => setForm({ ...form, agree: !!v })}
          />
          <span>
            {dict.register.agreePrefix}{" "}
            <Link href="/about#risk-disclaimer" className="text-gold-400 hover:underline">
              {dict.register.agreeLink}
            </Link>
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? dict.register.creatingAccount : dict.register.createAccount}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-foreground/60">
        {dict.register.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-semibold text-gold-400 hover:underline">
          {dict.register.logIn}
        </Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
