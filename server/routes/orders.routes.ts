import { Router } from "express";
import { storage } from "../storage";
import { insertOrderSchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  const orderData = insertOrderSchema.parse(req.body);
  const order = await storage.createOrder(orderData);
  res.json(order);
});

router.get("/user/:userId", requireAuth, async (req, res, next) => {
  const { userId } = req.params;
  const orders = await storage.getOrdersByUser(userId);
  res.json(orders);
});

export default router;
