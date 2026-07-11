"use client";

import { useEffect, useRef } from "react";

export function TradingViewTechnical() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width: "100%",
      isTransparent: true,
      height: 450,
      symbol: "OANDA:XAUUSD",
      showIntervalTabs: true,
      locale: "en",
      colorTheme: "dark",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900 p-2">
      <div ref={container} className="tradingview-widget-container h-full w-full">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}
