import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  storeName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  storeAddress: { type: String, required: true },
});

export default mongoose.model("Admin", adminSchema);