import { Router } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

router.post("/stripe", async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return res.status(400).json({ message: "Missing signature or webhook secret" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);

      // Handle CEO T-shirt purchase
      if (paymentIntent.metadata?.product_type === 'ceo_tshirt') {
        const userId = paymentIntent.metadata.user_id;
        if (userId) {
          await storage.updateUser(userId, {
            hasCeoTshirt: true,
            tshirtPurchaseDate: new Date()
          });
          console.log('CEO T-shirt activated for user:', userId);
        }
      }

      // Update payment status in database
      const metadata = paymentIntent.metadata;
      if (metadata?.orderId || metadata?.rideId) {
        // Update order/ride status to completed
        if (metadata.orderId) {
          await storage.updateOrder(metadata.orderId, { status: "completed" });
        }
        if (metadata.rideId) {
          await storage.updateRide(metadata.rideId, { status: "completed" });
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
