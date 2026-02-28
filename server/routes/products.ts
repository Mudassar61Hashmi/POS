import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

router.post("/products", (req, res) => {
  const { name, price, quantity, category, barcode } = req.body;
  try {
    db.prepare("INSERT INTO products (name, price, quantity, category, barcode) VALUES (?, ?, ?, ?, ?)")
      .run(name, price, quantity, category, barcode);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/products/:id", (req, res) => {
  const { name, price, quantity, category, barcode } = req.body;
  const { id } = req.params;
  try {
    db.prepare("UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, barcode = ? WHERE id = ?")
      .run(name, price, quantity, category, barcode, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  try {
    // Check if product has sales history
    const hasSales = db.prepare("SELECT count(*) as count FROM sale_items WHERE product_id = ?").get(id) as { count: number };
    if (hasSales.count > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete product with sales history" });
    }
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
