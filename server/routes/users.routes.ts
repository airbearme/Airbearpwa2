import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/:userId/free-ride-status", requireAuth, async (req, res, next) => {
  const { userId } = req.params;
  const user = await storage.getUser(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if user has CEO T-shirt
  if (!user.hasCeoTshirt) {
    return res.json({
      canRideFree: false,
      reason: "No CEO T-shirt purchased"
    });
  }

  // Check if user has already used free ride today
  const today = new Date().toISOString().split('T')[0];
  const todayRides = await storage.getRidesByUserAndDate(userId, today);
  const freeRidesToday = todayRides.filter(ride => ride.isFreeTshirtRide);

  if (freeRidesToday.length > 0) {
    return res.json({
      canRideFree: false,
      reason: "Daily free ride already used"
    });
  }

  res.json({ canRideFree: true });
});

export default router;
