    import express from "express";
    import { 
    getStoreSettings, 
    updateStoreSettings, 
    toggleStoreStatus 
    } from "../controllers/store-settings-controller.js";

    const router = express.Router();

    // GET store settings (pass adminId as query param: ?adminId=xxx)
    router.get("/", getStoreSettings);

    // UPDATE store settings (including storeName, storeHours, and statuses)
    router.put("/", updateStoreSettings);

    // TOGGLE specific status (for quick button press from frontend)
    router.patch("/toggle-status", toggleStoreStatus);

    export default router;
