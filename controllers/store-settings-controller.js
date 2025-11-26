import StoreSettings from "../models/store-settings-model.js";
import Admin from "../models/admin-model.js";

// GET store settings by adminId
export const getStoreSettings = async (req, res) => {
  try {
    const { adminId } = req.query; // Pass adminId as query parameter
    
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    let settings = await StoreSettings.findOne({ adminId });
    
    // If settings don't exist, create them with admin's storeName
    if (!settings) {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      settings = await StoreSettings.create({
        adminId,
        storeName: admin.storeName,
        storeHours: "9:00AM - 6:00PM",
        physicalStatus: true,
        onlineStatus: true,
        deliveryStatus: true,
      });
    }
    
    res.status(200).json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching store settings" });
  }
};

// UPDATE store settings (including storeName which syncs with admin)
export const updateStoreSettings = async (req, res) => {
  try {
    const { adminId, storeName, storeHours, physicalStatus, onlineStatus, deliveryStatus } = req.body;
    
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    let settings = await StoreSettings.findOne({ adminId });
    
    if (!settings) {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      settings = await StoreSettings.create({
        adminId,
        storeName: storeName || admin.storeName,
        storeHours: storeHours || "9:00AM - 6:00PM",
        physicalStatus: physicalStatus !== undefined ? physicalStatus : true,
        onlineStatus: onlineStatus !== undefined ? onlineStatus : true,
        deliveryStatus: deliveryStatus !== undefined ? deliveryStatus : true,
      });
    } else {
      // Update settings
      if (storeName !== undefined) settings.storeName = storeName;
      if (storeHours !== undefined) settings.storeHours = storeHours;
      if (physicalStatus !== undefined) settings.physicalStatus = physicalStatus;
      if (onlineStatus !== undefined) settings.onlineStatus = onlineStatus;
      if (deliveryStatus !== undefined) settings.deliveryStatus = deliveryStatus;
      
      await settings.save();
    }

    // If storeName was updated, also update the admin's storeName
    if (storeName !== undefined) {
      await Admin.findByIdAndUpdate(adminId, { storeName });
    }

    res.status(200).json({ message: "Store settings updated successfully", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating store settings" });
  }
};

// TOGGLE store status (for quick button toggles from frontend)
export const toggleStoreStatus = async (req, res) => {
  try {
    const { adminId, statusType, value } = req.body;
    // statusType can be: 'physicalStatus', 'onlineStatus', 'deliveryStatus'
    
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    if (!statusType || !['physicalStatus', 'onlineStatus', 'deliveryStatus'].includes(statusType)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    let settings = await StoreSettings.findOne({ adminId });
    
    if (!settings) {
      return res.status(404).json({ message: "Store settings not found. Please create settings first." });
    }

    // Toggle or set the status
    if (value !== undefined) {
      settings[statusType] = value;
    } else {
      settings[statusType] = !settings[statusType]; // Toggle if value not provided
    }

    await settings.save();

    res.status(200).json({ 
      message: `${statusType} updated successfully`, 
      settings 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error toggling store status" });
  }
};
