import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/sales", (req, res) => {
  const sales = db.prepare(`
    SELECT sales.*, users.username as cashier 
    FROM sales 
    JOIN users ON sales.user_id = users.id 
    ORDER BY timestamp DESC
  `).all();
  res.json(sales);
});

router.get("/sales/:id", (req, res) => {
  const { id } = req.params;
  const items = db.prepare(`
    SELECT sale_items.*, products.name 
    FROM sale_items 
    JOIN products ON sale_items.product_id = products.id 
    WHERE sale_id = ?
  `).all(id);
  res.json(items);
});

router.post("/checkout", (req, res) => {
  const { userId, items, total } = req.body;
  
  const transaction = db.transaction(() => {
    const sale = db.prepare("INSERT INTO sales (user_id, total) VALUES (?, ?)").run(userId, total);
    const saleId = sale.lastInsertRowid;

    for (const item of items) {
      // Update stock
      const product = db.prepare("SELECT quantity FROM products WHERE id = ?").get(item.id) as { quantity: number };
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.id}`);
      }
      db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(item.quantity, item.id);
      
      // Record sale item
      db.prepare("INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)")
        .run(saleId, item.id, item.quantity, item.price);
    }
    return saleId;
  });

  try {
    const saleId = transaction();
    res.json({ success: true, saleId });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
