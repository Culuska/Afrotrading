import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md flex-col justify-center px-4 py-16">
      <Link href="/" className="mx-auto mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient-bg">
          <TrendingUp className="h-5 w-5 text-navy-950" strokeWidth={2.5} />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">
          Afro<span className="gold-gradient-text">Trading</span>
        </span>
      </Link>

      <Card className="glass-card">
        <CardContent className="p-8">
          <h1 className="font-display text-2xl font-bold text-center">{title}</h1>
          {description && <p className="mt-2 text-center text-sm text-foreground/60">{description}</p>}
          <div className="mt-8">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
