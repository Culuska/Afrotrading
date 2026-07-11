import { Router } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { logAudit } from "@/utils/audit";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ testimonials });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ testimonials });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    await logAudit(req.user!.id, "CREATE_TESTIMONIAL", "Testimonial", testimonial.id);
    res.status(201).json({ testimonial });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const testimonial = await prisma.testimonial.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req.user!.id, "UPDATE_TESTIMONIAL", "Testimonial", testimonial.id);
    res.json({ testimonial });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_TESTIMONIAL", "Testimonial", req.params.id);
    res.json({ message: "Testimonial deleted" });
  })
);

export default router;
