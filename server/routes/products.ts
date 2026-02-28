import { Router } from "express";
import { Product } from "../models/Product";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    // Map _id to id for frontend compatibility
    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      category: p.category,
      barcode: p.barcode
    }));
    res.json(formattedProducts);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/products", async (req, res) => {
  const { name, price, quantity, category, barcode } = req.body;
  try {
    const product = new Product({ name, price, quantity, category, barcode });
    await product.save();
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/products/:id", async (req, res) => {
  const { name, price, quantity, category, barcode } = req.body;
  const { id } = req.params;
  try {
    await Product.findByIdAndUpdate(id, { name, price, quantity, category, barcode });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
