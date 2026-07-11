import { Router } from "express";
import asyncHandler from "express-async-handler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { sendTelegramMessage } from "@/utils/telegram";

const router = Router();

router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    res.json({
      configured: !!process.env.TELEGRAM_BOT_TOKEN,
      groupUrl: process.env.TELEGRAM_GROUP_URL || null,
      channelUrl: process.env.TELEGRAM_CHANNEL_URL || null,
    });
  })
);

router.post(
  "/broadcast",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    const result = await sendTelegramMessage(message);
    res.json({ sent: !!result });
  })
);

export default router;
