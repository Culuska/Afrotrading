"use client";

import { useState } from "react";
import { MessageCircle, Send, X, Headset } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TELEGRAM_GROUP_URL, WHATSAPP_URL } from "@/lib/config";

export function FloatingActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            className="flex flex-col gap-2"
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" /> Telegram
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full gold-gradient-bg text-navy-950 shadow-xl shadow-gold-500/30 animate-pulse-gold transition-transform hover:scale-105"
        aria-label="Contact us"
      >
        {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
      </button>
    </div>
  );
}
