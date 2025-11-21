import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  name: { type: String, required: true },
  variation: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  description: { type: String },
  weight: { type: Number, required: true, min: 0 },
  shelfLife: { type: Date },
  createdAt: { type: Date, default: Date.now },

  // ⭐ Soft Delete
  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model("Product", productSchema);
