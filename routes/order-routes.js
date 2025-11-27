import express from "express";
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getCustomerNotifications,
  markNotificationsAsRead,
  cancelOrder
} from "../controllers/order-controller.js";

const router = express.Router();

// CREATE ORDER / CHECKOUT
// POST /api/orders/checkout
router.post("/checkout", createOrder);

// GET ALL ORDERS FOR A CUSTOMER
// GET /api/orders/customer/:userId
router.get("/customer/:userId", getCustomerOrders);

// GET SINGLE ORDER DETAILS
// GET /api/orders/:orderId
router.get("/:orderId", getOrderById);

// GET CUSTOMER NOTIFICATIONS
// GET /api/orders/notifications/:userId
router.get("/notifications/:userId", getCustomerNotifications);

// MARK NOTIFICATIONS AS READ
// PUT /api/orders/notifications/read
router.put("/notifications/read", markNotificationsAsRead);

// CANCEL ORDER (Customer-initiated)
// PUT /api/orders/:orderId/cancel
router.put("/:orderId/cancel", cancelOrder);

export default router;


