import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

const router = Router();
if (!process.env.JWT_SECRET) {
  throw new Error('Missing required JWT secret: JWT_SECRET');
}
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res, next) => {
  const { email, password, username, role } = insertUserSchema.parse(req.body);
  const existingUser = await storage.getUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await storage.createUser({ email, password: hashedPassword, username, role });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await storage.getUserByEmail(email);

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
});

export default router;
