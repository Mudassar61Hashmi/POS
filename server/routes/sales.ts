import { Router } from "express";
import { Sale } from "../models/Sale";
import { Product } from "../models/Product";
import mongoose from "mongoose";

const router = Router();

router.get("/sales", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    const formattedSales = sales.map(s => ({
      id: s._id,
      user_id: s.user_id,
      total: s.total,
      timestamp: s.createdAt,
      cashier: s.cashier
    }));
    res.json(formattedSales);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/sales/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    
    const formattedItems = sale.items.map(item => ({
      id: item._id,
      sale_id: sale._id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
    res.json(formattedItems);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/checkout", async (req, res) => {
  const { userId, items, total, cashier } = req.body;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the sale
    const sale = new Sale({
      user_id: userId,
      cashier: cashier || "Unknown",
      total,
      items: items.map((item: any) => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    });

    await sale.save({ session });

    // 2. Update stock for each item
    for (const item of items) {
      const product = await Product.findById(item.id).session(session);
      if (!product || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }
      product.quantity -= item.quantity;
      await product.save({ session });
    }

    await session.commitTransaction();
    res.json({ success: true, saleId: sale._id });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
