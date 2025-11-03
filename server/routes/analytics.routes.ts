import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/overview", requireAuth, async (req, res, next) => {
  const spots = await storage.getAllSpots();
  const rickshaws = await storage.getAllRickshaws();
  const activeRickshaws = rickshaws.filter(r => r.isAvailable && !r.isCharging);
  const chargingRickshaws = rickshaws.filter(r => r.isCharging);
  const maintenanceRickshaws = rickshaws.filter(r => r.maintenanceStatus !== "good");

  const analytics = {
    totalSpots: spots.length,
    totalRickshaws: rickshaws.length,
    activeRickshaws: activeRickshaws.length,
    chargingRickshaws: chargingRickshaws.length,
    maintenanceRickshaws: maintenanceRickshaws.length,
    averageBatteryLevel: rickshaws.length > 0
      ? Math.round(rickshaws.reduce((sum, r) => sum + r.batteryLevel, 0) / rickshaws.length)
      : 0
  };

  res.json(analytics);
});

export default router;
