import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/", async (req, res, next) => {
  const spots = await storage.getAllSpots();
  res.json(spots);
});

export default router;
