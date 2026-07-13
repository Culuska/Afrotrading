"use client";

import { useEffect, useRef } from "react";

const SYMBOLS = [
  { proName: "OANDA:XAUUSD", title: "Gold (XAUUSD)" },
  { proName: "OANDA:EURUSD", title: "EUR/USD" },
  { proName: "OANDA:GBPUSD", title: "GBP/USD" },
  { proName: "OANDA:USDJPY", title: "USD/JPY" },
  { proName: "TVC:DXY", title: "US Dollar Index" },
  { proName: "TVC:SILVER", title: "Silver" },
];

export function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="w-full border-y border-black/5 bg-navy-950/60">
      <div ref={container} className="tradingview-widget-container" />
    </div>
  );
}
