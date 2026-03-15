import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  cashier: { type: String, required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  items: [saleItemSchema]
}, { timestamps: true });

export const Sale = mongoose.model("Sale", saleSchema);
