import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },   // for email/password login
  photoUrl: { type: String },   // for Google login
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
