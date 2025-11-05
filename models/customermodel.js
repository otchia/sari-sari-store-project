import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
