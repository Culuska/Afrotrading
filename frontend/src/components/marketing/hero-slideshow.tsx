"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    src: "/images/hero/slide-1.jpg",
    alt: "Live market overview dashboard on a mobile phone showing candlestick charts and portfolio performance",
    caption: "Real-time market overview, wherever you are",
  },
  {
    src: "/images/hero/slide-2.jpg",
    alt: "Mobile app showing an instant buy signal alert with spread and balance details",
    caption: "Instant buy & sell signal alerts",
  },
  {
    src: "/images/hero/slide-3.jpg",
    alt: "Laptop showing gold price chart analysis with an AI market assistant chat panel",
    caption: "AI-powered market analysis, 24/7",
  },
];

const SLIDE_DURATION_MS = 4500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-black/5 bg-navy-800 shadow-xl shadow-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={SLIDES[index].src}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            fill
            unoptimized
            priority={index === 0}
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-10">
            <p className="text-sm font-semibold text-white">{SLIDES[index].caption}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-gold-500" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
