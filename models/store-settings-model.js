import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin", 
    required: true,
    unique: true // Each admin has one store settings
  },
  storeName: { type: String, required: true },
  storeHours: { type: String, default: "9:00AM - 6:00PM" },
  physicalStatus: { type: Boolean, default: true },
  onlineStatus: { type: Boolean, default: true },
  deliveryStatus: { type: Boolean, default: true },
}, { timestamps: true });

const StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema);
export default StoreSettings;