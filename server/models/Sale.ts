import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cashier: { type: String, required: true },
  total: { type: Number, required: true },
  items: [saleItemSchema]
}, { timestamps: true });

export const Sale = mongoose.model("Sale", saleSchema);
