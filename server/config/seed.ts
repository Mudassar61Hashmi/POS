import { User } from "../models/User";
import { Product } from "../models/Product";
import mongoose from "mongoose";
import connectDB from "./db";

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});

  // Seed Users
  await User.create([
    { username: "admin", password: "admin123", role: "admin" },
    { username: "cashier", password: "cashier123", role: "cashier" }
  ]);

  // Seed Products
  await Product.create([
    { name: "Apple", price: 0.5, quantity: 100, category: "Fruits", barcode: "1001" },
    { name: "Milk", price: 1.2, quantity: 50, category: "Dairy", barcode: "1002" },
    { name: "Bread", price: 2.0, quantity: 30, category: "Bakery", barcode: "1003" }
  ]);

  console.log("Database Seeded!");
  process.exit();
};

seed();
