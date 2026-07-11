import { Router } from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import slugify from "@/utils/slugify";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, optionalAuth, AuthRequest } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { logAudit } from "@/utils/audit";

const router = Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { category, type, search, featured } = req.query as Record<string, string>;
    const where: any = { published: true };
    if (category) where.category = category;
    if (type) where.type = type;
    if (featured === "true") where.featured = true;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const isVip = req.user?.role === "VIP" || req.user?.role === "ADMIN";
    if (!isVip) where.vipOnly = false;

    const content = await prisma.educationContent.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ content });
  })
);

router.get(
  "/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const content = await prisma.educationContent.findUnique({ where: { slug: req.params.slug } });
    if (!content || !content.published) {
      res.status(404).json({ message: "Content not found" });
      return;
    }
    res.json({ content });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const content = await prisma.educationContent.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ content });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [body("title").notEmpty(), body("type").isIn(["VIDEO", "PDF", "IMAGE", "ARTICLE"]), body("category").notEmpty()],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, type, category, videoUrl, youtubeUrl, fileUrl, imageUrl, body: contentBody, featured, vipOnly, published } = req.body;
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const content = await prisma.educationContent.create({
      data: { title, slug, description, type, category, videoUrl, youtubeUrl, fileUrl, imageUrl, body: contentBody, featured: !!featured, vipOnly: !!vipOnly, published: published !== false },
    });
    await logAudit(req.user!.id, "CREATE_EDUCATION", "EducationContent", content.id);
    res.status(201).json({ content });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const content = await prisma.educationContent.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req.user!.id, "UPDATE_EDUCATION", "EducationContent", content.id);
    res.json({ content });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.educationContent.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.id, "DELETE_EDUCATION", "EducationContent", req.params.id);
    res.json({ message: "Content deleted" });
  })
);

export default router;
