import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "driver", "admin"]);
export const rideStatusEnum = pgEnum("ride_status", ["pending", "accepted", "in_progress", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["stripe", "apple_pay", "google_pay", "cash"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  ecoPoints: integer("eco_points").notNull().default(0),
  totalRides: integer("total_rides").notNull().default(0),
  co2Saved: decimal("co2_saved", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

// Spots table (from CSV data)
export const spots = pgTable("spots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Rickshaws table
export const rickshaws = pgTable("rickshaws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => users.id),
  currentSpotId: varchar("current_spot_id").references(() => spots.id),
  batteryLevel: integer("battery_level").notNull().default(100),
  isAvailable: boolean("is_available").notNull().default(true),
  isCharging: boolean("is_charging").notNull().default(false),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }).notNull().default("0"),
  maintenanceStatus: text("maintenance_status").notNull().default("good"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Rides table
export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  driverId: varchar("driver_id").references(() => users.id),
  rickshawId: varchar("rickshaw_id").references(() => rickshaws.id),
  pickupSpotId: varchar("pickup_spot_id").notNull().references(() => spots.id),
  destinationSpotId: varchar("destination_spot_id").notNull().references(() => spots.id),
  status: rideStatusEnum("status").notNull().default("pending"),
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  distance: decimal("distance", { precision: 8, scale: 2 }), // km
  co2Saved: decimal("co2_saved", { precision: 8, scale: 2 }), // kg
  fare: decimal("fare", { precision: 8, scale: 2 }).notNull(),
  requestedAt: timestamp("requested_at").notNull().default(sql`now()`),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at")
});

// Bodega items table
export const bodegaItems = pgTable("bodega_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isEcoFriendly: boolean("is_eco_friendly").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Rickshaw inventory table (many-to-many between rickshaws and bodega items)
export const rickshawInventory = pgTable("rickshaw_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rickshawId: varchar("rickshaw_id").notNull().references(() => rickshaws.id),
  itemId: varchar("item_id").notNull().references(() => bodegaItems.id),
  quantity: integer("quantity").notNull().default(0),
  lastRestocked: timestamp("last_restocked").default(sql`now()`)
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rideId: varchar("ride_id").references(() => rides.id),
  rickshawId: varchar("rickshaw_id").references(() => rickshaws.id),
  items: jsonb("items").notNull(), // Array of {itemId, quantity, price}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  rideId: varchar("ride_id").references(() => rides.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSpotSchema = createInsertSchema(spots).omit({
  id: true,
  createdAt: true
});

export const insertRickshawSchema = createInsertSchema(rickshaws).omit({
  id: true,
  createdAt: true
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  requestedAt: true,
  acceptedAt: true,
  startedAt: true,
  completedAt: true
});

export const insertBodegaItemSchema = createInsertSchema(bodegaItems).omit({
  id: true,
  createdAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Spot = typeof spots.$inferSelect;
export type InsertSpot = z.infer<typeof insertSpotSchema>;
export type Rickshaw = typeof rickshaws.$inferSelect;
export type InsertRickshaw = z.infer<typeof insertRickshawSchema>;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type BodegaItem = typeof bodegaItems.$inferSelect;
export type InsertBodegaItem = z.infer<typeof insertBodegaItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
