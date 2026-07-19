import { TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandSeal({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-double border-gold-500/60 bg-gold-500/5 p-3 text-center shadow-lg shadow-gold-500/10",
        className
      )}
    >
      <TrendingUp className="h-5 w-5 text-gold-400" strokeWidth={2.5} />
      <span className="font-display text-[0.65rem] font-extrabold uppercase leading-tight tracking-widest text-foreground">
        Afro
        <br />
        Trading
      </span>
      <span className="flex items-center gap-0.5 text-gold-400">
        <Star className="h-2 w-2 fill-current" />
        <Star className="h-2 w-2 fill-current" />
        <Star className="h-2 w-2 fill-current" />
      </span>
    </div>
  );
}
