import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { IStorage } from './storage';
import {
  users,
  spots,
  airbears,
  rides,
  bodegaItems,
  orders,
  payments,
  User,
  InsertUser,
  Spot,
  InsertSpot,
  Airbear,
  InsertAirbear,
  Ride,
  InsertRide,
  BodegaItem,
  InsertBodegaItem,
  Order,
  InsertOrder,
  Payment,
  InsertPayment,
} from '@shared/schema';

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]> {
    throw new Error('Method not implemented.');
  }

  // Spots
  async getAllSpots(): Promise<Spot[]> {
    return db.select().from(spots);
  }

  async createSpot(spot: InsertSpot): Promise<Spot> {
    const result = await db.insert(spots).values(spot).returning();
    return result[0];
  }

  async getSpotById(id: string): Promise<Spot | undefined> {
    const result = await db.select().from(spots).where(eq(spots.id, id));
    return result[0];
  }

  // Airbears
  async getAllAirbears(): Promise<Airbear[]> {
    return db.select().from(airbears);
  }

  async getAvailableAirbears(): Promise<Airbear[]> {
    return db.select().from(airbears).where(eq(airbears.isAvailable, true));
  }

  async getAirbearsByDriver(driverId: string): Promise<Airbear[]> {
    return db.select().from(airbears).where(eq(airbears.driverId, driverId));
  }

  async createAirbear(airbear: InsertAirbear): Promise<Airbear> {
    const result = await db.insert(airbears).values(airbear).returning();
    return result[0];
  }

  async updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear> {
    const result = await db.update(airbears).set(updates).where(eq(airbears.id, id)).returning();
    return result[0];
  }

  // Rides
  async getRidesByUser(userId: string): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.userId, userId));
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    return db.select().from(rides).where(eq(rides.driverId, driverId));
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const result = await db.insert(rides).values(ride).returning();
    return result[0];
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const result = await db.update(rides).set(updates).where(eq(rides.id, id)).returning();
    return result[0];
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    const result = await db.select().from(rides).where(eq(rides.id, id));
    return result[0];
  }

  // Bodega Items
  async getAllBodegaItems(): Promise<BodegaItem[]> {
    return db.select().from(bodegaItems);
  }

  async getBodegaItemsByCategory(category: string): Promise<BodegaItem[]> {
    return db.select().from(bodegaItems).where(eq(bodegaItems.category, category));
  }

  async createBodegaItem(item: InsertBodegaItem): Promise<BodegaItem> {
    const result = await db.insert(bodegaItems).values(item).returning();
    return result[0];
  }

  async updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem> {
    const result = await db.update(bodegaItems).set(updates).where(eq(bodegaItems.id, id)).returning();
    return result[0];
  }

  // Orders
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Payments
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const result = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return result[0];
  }
}
