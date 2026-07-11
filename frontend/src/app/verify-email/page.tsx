"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time token verification on mount
      setStatus("error");
      return;
    }
    api
      .get(`/api/auth/verify-email?token=${token}`, { auth: false })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setStatus("error");
        if (err instanceof ApiError) console.error(err.message);
      });
  }, [token]);

  return (
    <AuthCard title="Email Verification">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-gold-400" />}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="text-sm text-foreground/70">Your email has been verified successfully.</p>
            <Button asChild className="w-full">
              <Link href="/login">Continue to Login</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-14 w-14 text-danger" />
            <p className="text-sm text-foreground/70">This verification link is invalid or has expired.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
