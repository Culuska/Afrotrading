import { Router } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { requireAuth, requireRole, AuthRequest } from "@/middleware/auth";
import { uploadBuffer } from "@/utils/cloudinary";
import { prisma } from "@/lib/prisma";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/webm", "video/quicktime",
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a",
      "application/pdf",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
});

function resourceTypeFor(mimetype: string): "image" | "video" | "raw" {
  if (mimetype.startsWith("image/")) return "image";
  // Cloudinary handles audio under its "video" resource type.
  if (mimetype.startsWith("video/") || mimetype.startsWith("audio/")) return "video";
  return "raw";
}

function mediaTypeFor(mimetype: string): "IMAGE" | "VIDEO" | "AUDIO" | "PDF" {
  if (mimetype.startsWith("image/")) return "IMAGE";
  if (mimetype.startsWith("video/")) return "VIDEO";
  if (mimetype.startsWith("audio/")) return "AUDIO";
  return "PDF";
}

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("file"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const { folder = "media" } = req.body;
    const resourceType = resourceTypeFor(req.file.mimetype);
    const { url, publicId } = await uploadBuffer(req.file.buffer, folder, resourceType);

    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        publicId,
        type: mediaTypeFor(req.file.mimetype),
        fileName: req.file.originalname,
        sizeBytes: req.file.size,
        uploadedById: req.user!.id,
      },
    });

    res.status(201).json({ asset });
  })
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { search, type } = req.query as Record<string, string>;
    const where: any = {};
    if (type) where.type = type;
    if (search) where.fileName = { contains: search, mode: "insensitive" };
    const assets = await prisma.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ assets });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.mediaAsset.delete({ where: { id: req.params.id } });
    res.json({ message: "Asset deleted" });
  })
);

export default router;
