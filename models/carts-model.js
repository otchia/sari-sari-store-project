import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  removed: { type: Boolean, default: false }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [cartItemSchema],
  status: { type: String, enum: ["pending", "ordered"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Cart", cartSchema);
