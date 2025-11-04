import { type User, type InsertUser, type Spot, type InsertSpot, type Airbear, type InsertAirbear, type Ride, type InsertRide, type BodegaItem, type InsertBodegaItem, type Order, type InsertOrder, type Payment, type InsertPayment } from "@shared/schema";
import { DrizzleStorage } from "./drizzleStorage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Enhanced user methods
  getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]>;

  // Spots
  getAllSpots(): Promise<Spot[]>;
  createSpot(spot: InsertSpot): Promise<Spot>;
  getSpotById(id: string): Promise<Spot | undefined>;

  // Airbears
  getAllAirbears(): Promise<Airbear[]>;
  getAvailableAirbears(): Promise<Airbear[]>;
  getAirbearsByDriver(driverId: string): Promise<Airbear[]>;
  createAirbear(airbear: InsertAirbear): Promise<Airbear>;
  updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear>;

  // Rides
  getRidesByUser(userId: string): Promise<Ride[]>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride>;
  getRideById(id: string): Promise<Ride | undefined>;

  // Bodega Items
  getAllBodegaItems(): Promise<BodegaItem[]>;
  getBodegaItemsByCategory(category: string): Promise<BodegaItem[]>;
  createBodegaItem(item: InsertBodegaItem): Promise<BodegaItem>;
  updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem>;

  // Orders
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;

  // Payments
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
}

export const storage = new DrizzleStorage();
