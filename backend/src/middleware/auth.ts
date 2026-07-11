import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "FREE" | "VIP" | "ADMIN";
    email: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = (req as any).cookies?.token;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.status === "SUSPENDED") {
      return res.status(401).json({ message: "Account not authorized" });
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Array<"FREE" | "VIP" | "ADMIN">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = (req as any).cookies?.token;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken;
    if (token) {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user) req.user = { id: user.id, role: user.role, email: user.email };
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
