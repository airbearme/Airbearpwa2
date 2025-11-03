import { Router } from "express";
import { storage } from "../storage";
import { insertRideSchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  const rideData = insertRideSchema.parse(req.body);
  const ride = await storage.createRide(rideData);
  res.json(ride);
});

router.get("/user/:userId", requireAuth, async (req, res, next) => {
  const { userId } = req.params;
  const rides = await storage.getRidesByUser(userId);
  res.json(rides);
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const ride = await storage.updateRide(id, updates);
  res.json(ride);
});

export default router;
