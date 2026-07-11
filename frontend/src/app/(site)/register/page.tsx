"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TELEGRAM_GROUP_URL as TELEGRAM_URL } from "@/lib/config";

export default function RegisterPage() {
  const { register } = useAuth();
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
      toast.error("Passwords do not match");
      return;
    }
    if (!form.agree) {
      toast.error("You must agree to the Terms & Conditions");
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
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Welcome to AfroTrading!" description="Your account has been created successfully.">
        <div className="flex flex-col items-center gap-5 text-center">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <p className="text-sm text-foreground/70">
            We&apos;ve sent a verification link to your email. Join our Telegram community now to receive
            signal alerts instantly.
          </p>
          <Button asChild size="lg" className="w-full">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Send className="h-4 w-4" /> Join our Telegram Community
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create Your Account" description="Join thousands of traders receiving premium gold signals.">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            I agree to the{" "}
            <Link href="/about#risk-disclaimer" className="text-gold-400 hover:underline">
              Terms &amp; Risk Disclaimer
            </Link>
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-gold-400 hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
