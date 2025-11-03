import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/", async (req, res, next) => {
  const rickshaws = await storage.getAllRickshaws();
  res.json(rickshaws);
});

router.get("/available", async (req, res, next) => {
  const rickshaws = await storage.getAvailableRickshaws();
  res.json(rickshaws);
});

export default router;
