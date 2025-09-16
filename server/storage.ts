import { type User, type InsertUser, type Spot, type InsertSpot, type Rickshaw, type InsertRickshaw, type Ride, type InsertRide, type BodegaItem, type InsertBodegaItem, type Order, type InsertOrder, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Spots
  getAllSpots(): Promise<Spot[]>;
  createSpot(spot: InsertSpot): Promise<Spot>;
  getSpotById(id: string): Promise<Spot | undefined>;

  // Rickshaws
  getAllRickshaws(): Promise<Rickshaw[]>;
  getAvailableRickshaws(): Promise<Rickshaw[]>;
  getRickshawsByDriver(driverId: string): Promise<Rickshaw[]>;
  createRickshaw(rickshaw: InsertRickshaw): Promise<Rickshaw>;
  updateRickshaw(id: string, updates: Partial<Rickshaw>): Promise<Rickshaw>;

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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private spots: Map<string, Spot> = new Map();
  private rickshaws: Map<string, Rickshaw> = new Map();
  private rides: Map<string, Ride> = new Map();
  private bodegaItems: Map<string, BodegaItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize spots from CSV data
    const spotsData = [
      { name: "Court Street Downtown", latitude: "42.099118", longitude: "-75.917538" },
      { name: "Riverwalk BU Center", latitude: "42.098765", longitude: "-75.916543" },
      { name: "Confluence Park", latitude: "42.090123", longitude: "-75.912345" },
      { name: "Southside Walking Bridge", latitude: "42.091409", longitude: "-75.914568" },
      { name: "General Hospital", latitude: "42.086741", longitude: "-75.915711" },
      { name: "McArthur Park", latitude: "42.086165", longitude: "-75.926153" },
      { name: "Greenway Path", latitude: "42.086678", longitude: "-75.932483" },
      { name: "Vestal Center", latitude: "42.091851", longitude: "-75.951729" },
      { name: "Innovation Park", latitude: "42.093877", longitude: "-75.958331" },
      { name: "BU East Gym", latitude: "42.091695", longitude: "-75.963590" },
      { name: "BU Fine Arts Building", latitude: "42.089282", longitude: "-75.967441" },
      { name: "Whitney Hall", latitude: "42.088456", longitude: "-75.965432" },
      { name: "Student Union", latitude: "42.086903", longitude: "-75.966704" },
      { name: "Appalachian Dining", latitude: "42.084523", longitude: "-75.971264" },
      { name: "Hinman Dining Hall", latitude: "42.086314", longitude: "-75.973292" },
      { name: "BU Science Building", latitude: "42.090227", longitude: "-75.972315" }
    ];

    spotsData.forEach(spotData => {
      const spot: Spot = {
        id: randomUUID(),
        name: spotData.name,
        latitude: spotData.latitude,
        longitude: spotData.longitude,
        isActive: true,
        createdAt: new Date()
      };
      this.spots.set(spot.id, spot);
    });

    // Initialize sample bodega items
    const bodegaItemsData = [
      { name: "Local Coffee Blend", description: "Binghamton roasted, eco-friendly packaging", price: "12.99", category: "beverages", isEcoFriendly: true, stock: 20 },
      { name: "Fresh Produce Box", description: "Locally sourced, seasonal selection", price: "24.99", category: "food", isEcoFriendly: true, stock: 15 },
      { name: "Eco Water Bottle", description: "Bamboo fiber, BPA-free, 500ml", price: "18.99", category: "accessories", isEcoFriendly: true, stock: 30 },
      { name: "Energy Snack Mix", description: "Locally made, organic ingredients", price: "8.99", category: "snacks", isEcoFriendly: true, stock: 25 }
    ];

    bodegaItemsData.forEach(itemData => {
      const item: BodegaItem = {
        id: randomUUID(),
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        imageUrl: null,
        category: itemData.category,
        isEcoFriendly: itemData.isEcoFriendly,
        isAvailable: true,
        stock: itemData.stock,
        createdAt: new Date()
      };
      this.bodegaItems.set(item.id, item);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Spots
  async getAllSpots(): Promise<Spot[]> {
    return Array.from(this.spots.values());
  }

  async createSpot(insertSpot: InsertSpot): Promise<Spot> {
    const spot: Spot = {
      ...insertSpot,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.spots.set(spot.id, spot);
    return spot;
  }

  async getSpotById(id: string): Promise<Spot | undefined> {
    return this.spots.get(id);
  }

  // Rickshaws
  async getAllRickshaws(): Promise<Rickshaw[]> {
    return Array.from(this.rickshaws.values());
  }

  async getAvailableRickshaws(): Promise<Rickshaw[]> {
    return Array.from(this.rickshaws.values()).filter(r => r.isAvailable && !r.isCharging);
  }

  async getRickshawsByDriver(driverId: string): Promise<Rickshaw[]> {
    return Array.from(this.rickshaws.values()).filter(r => r.driverId === driverId);
  }

  async createRickshaw(insertRickshaw: InsertRickshaw): Promise<Rickshaw> {
    const rickshaw: Rickshaw = {
      ...insertRickshaw,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.rickshaws.set(rickshaw.id, rickshaw);
    return rickshaw;
  }

  async updateRickshaw(id: string, updates: Partial<Rickshaw>): Promise<Rickshaw> {
    const rickshaw = this.rickshaws.get(id);
    if (!rickshaw) throw new Error("Rickshaw not found");
    const updatedRickshaw = { ...rickshaw, ...updates };
    this.rickshaws.set(id, updatedRickshaw);
    return updatedRickshaw;
  }

  // Rides
  async getRidesByUser(userId: string): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(r => r.userId === userId);
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(r => r.driverId === driverId);
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const ride: Ride = {
      ...insertRide,
      id: randomUUID(),
      requestedAt: new Date(),
      acceptedAt: null,
      startedAt: null,
      completedAt: null
    };
    this.rides.set(ride.id, ride);
    return ride;
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const ride = this.rides.get(id);
    if (!ride) throw new Error("Ride not found");
    const updatedRide = { ...ride, ...updates };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  // Bodega Items
  async getAllBodegaItems(): Promise<BodegaItem[]> {
    return Array.from(this.bodegaItems.values());
  }

  async getBodegaItemsByCategory(category: string): Promise<BodegaItem[]> {
    return Array.from(this.bodegaItems.values()).filter(item => item.category === category);
  }

  async createBodegaItem(insertItem: InsertBodegaItem): Promise<BodegaItem> {
    const item: BodegaItem = {
      ...insertItem,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.bodegaItems.set(item.id, item);
    return item;
  }

  async updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem> {
    const item = this.bodegaItems.get(id);
    if (!item) throw new Error("Bodega item not found");
    const updatedItem = { ...item, ...updates };
    this.bodegaItems.set(id, updatedItem);
    return updatedItem;
  }

  // Orders
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      ...insertOrder,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Payments
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.userId === userId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
