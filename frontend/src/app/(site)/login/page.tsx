"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { ApiError } from "@/lib/api";
import { AuthCard } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { dict } = useI18n();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      toast.success(dict.login.welcomeBack);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : dict.login.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={dict.login.title} description={dict.login.subtitle}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{dict.login.email}</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{dict.login.password}</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-foreground/70">
            <Checkbox
              checked={form.rememberMe}
              onCheckedChange={(v) => setForm({ ...form, rememberMe: !!v })}
            />
            {dict.login.rememberMe}
          </label>
          <Link href="/forgot-password" className="text-gold-400 hover:underline">
            {dict.login.forgotPassword}
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? dict.login.loggingIn : dict.login.logIn}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-foreground/60">
        {dict.login.noAccount}{" "}
        <Link href="/register" className="font-semibold text-gold-400 hover:underline">
          {dict.login.createOne}
        </Link>
      </p>
    </AuthCard>
  );
}
