import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // Product Image
  category: { type: String, required: true }, // or Array if multiple categories
  brand: { type: String, required: true },
  name: { type: String, required: true },
  variation: { type: String }, // Optional
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  description: { type: String }, // Optional
  weight: { type: Number, required: true, min: 0 }, // in grams
  shelfLife: { type: Date }, // Optional
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Product", productSchema);