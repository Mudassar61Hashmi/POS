import { Router } from "express";
import { Customer } from "../models/Customer";

const router = Router();

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create customer
router.post("/customers", async (req, res) => {
  const { name, phone } = req.body;
  try {
    const customer = new Customer({ name, phone });
    await customer.save();
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update customer
router.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  try {
    const customer = await Customer.findByIdAndUpdate(id, { name, phone }, { new: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete customer
router.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
