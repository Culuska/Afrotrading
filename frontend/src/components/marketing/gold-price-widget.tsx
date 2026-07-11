"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BuySellButtons } from "@/components/marketing/hero";

export function GoldPriceWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: "OANDA:XAUUSD",
      width: "100%",
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div ref={container} className="tradingview-widget-container" />
        <BuySellButtons />
      </CardContent>
    </Card>
  );
}
