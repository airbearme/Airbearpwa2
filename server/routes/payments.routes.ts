import { Router } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { insertPaymentSchema } from "@shared/schema";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

router.post("/create-payment-intent", requireAuth, async (req, res, next) => {
  const { amount, orderId, rideId, paymentMethod = "stripe" } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  let paymentIntent;

  if (paymentMethod === "cash") {
    // For cash payments, generate QR code data
    const qrData = {
      orderId,
      rideId,
      amount,
      timestamp: Date.now(),
      method: "cash"
    };

    return res.json({
      qrCode: Buffer.from(JSON.stringify(qrData)).toString('base64'),
      paymentMethod: "cash"
    });
  } else {
    // Create Stripe PaymentIntent
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || "",
        rideId: rideId || "",
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  }
});

router.post("/confirm", requireAuth, async (req, res, next) => {
  const paymentData = insertPaymentSchema.parse(req.body);
  const payment = await storage.createPayment(paymentData);
  res.json(payment);
});

router.post("/ceo-tshirt/purchase", requireAuth, async (req, res, next) => {
  const { userId, size, amount } = req.body;

  // Create Stripe PaymentIntent for CEO T-shirt
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000, // $100.00 in cents
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      product_type: "ceo_tshirt",
      user_id: userId,
      size: size,
      unlimited_rides: "true",
      non_transferable: "true"
    }
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
});

export default router;
