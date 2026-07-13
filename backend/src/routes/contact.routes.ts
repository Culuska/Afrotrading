import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, optionalAuth, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { sendEmail, contactMessageEmailTemplate } from "@/utils/email";

const router = Router();

router.post(
  "/",
  optionalAuth,
  [body("name").notEmpty(), body("email").isEmail(), body("message").isLength({ min: 5 })],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, email, phone, subject, message } = req.body;
    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message, userId: req.user?.id },
    });

    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const notifyEmail = settings?.contactEmail || "support@theafrotrading.com";
    void sendEmail(
      notifyEmail,
      `New support message: ${subject || "General inquiry"}`,
      contactMessageEmailTemplate({ name, email, phone, subject, message })
    );

    res.status(201).json({ message: "Message received. We'll get back to you shortly.", id: contact.id });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ messages });
  })
);

router.patch(
  "/:id/resolve",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { resolved: true } });
    res.json({ message });
  })
);

export default router;
