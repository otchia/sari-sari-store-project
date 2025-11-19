import StoreSettings from "../models/store-settings-model.js";

// GET current settings
export const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.status(200).json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching store settings" });
  }
};

// UPDATE store settings
export const updateStoreSettings = async (req, res) => {
  try {
    const updates = req.body; // Expecting storeName, storeHours, physicalStatus, onlineStatus, deliveryStatus
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    res.status(200).json({ message: "Store settings updated", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating store settings" });
  }
};
