import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import xssClean from "xss-clean";

import { generalLimiter } from "@/middleware/rateLimit";
import { errorHandler, notFound } from "@/middleware/error";

import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import signalRoutes from "@/routes/signal.routes";
import educationRoutes from "@/routes/education.routes";
import marketAnalysisRoutes from "@/routes/marketAnalysis.routes";
import testimonialRoutes from "@/routes/testimonial.routes";
import pricingRoutes from "@/routes/pricing.routes";
import contactRoutes from "@/routes/contact.routes";
import statsRoutes from "@/routes/stats.routes";
import telegramRoutes from "@/routes/telegram.routes";
import uploadRoutes from "@/routes/upload.routes";
import settingsRoutes from "@/routes/settings.routes";
import paymentRoutes from "@/routes/payment.routes";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",");

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xssClean());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "afrotrading-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/signals", signalRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/market-analysis", marketAnalysisRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
