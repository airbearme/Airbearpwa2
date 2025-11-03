import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/items", async (req, res, next) => {
  const { category } = req.query;
  const items = category
    ? await storage.getBodegaItemsByCategory(category as string)
    : await storage.getAllBodegaItems();
  res.json(items);
});

export default router;
