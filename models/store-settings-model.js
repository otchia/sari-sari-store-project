import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "My Store" },
  storeHours: { type: String, default: "9:00AM - 6:00PM" },
  physicalStatus: { type: Boolean, default: true },
  onlineStatus: { type: Boolean, default: true },
  deliveryStatus: { type: Boolean, default: true },
}, { timestamps: true });

const StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema);
export default StoreSettings;