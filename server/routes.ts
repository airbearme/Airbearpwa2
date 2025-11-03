import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth.routes";
import rideRoutes from "./routes/rides.routes";
import paymentRoutes from "./routes/payments.routes";
import bodegaRoutes from "./routes/bodega.routes";
import orderRoutes from "./routes/orders.routes";
import userRoutes from "./routes/users.routes";
import analyticsRoutes from "./routes/analytics.routes";
import spotRoutes from "./routes/spots.routes";
import rickshawRoutes from "./routes/rickshaws.routes";
import webhookRoutes from "./routes/webhooks.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);
  app.use("/api/rides", rideRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/bodega", bodegaRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/spots", spotRoutes);
  app.use("/api/rickshaws", rickshawRoutes);
  app.use("/api/webhooks", webhookRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
