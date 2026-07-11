"use client";

import { useEffect, useRef } from "react";

export function TradingViewChart({ height = 480 }: { height?: number }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "OANDA:XAUUSD",
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(7, 11, 20, 1)",
      gridColor: "rgba(212, 175, 55, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900" style={{ height }}>
      <div ref={container} className="tradingview-widget-container h-full w-full">
        <div className="tradingview-widget-container__widget h-full w-full" />
      </div>
    </div>
  );
}
