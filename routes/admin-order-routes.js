import express from "express";
import {
  getAllOrders,
  getPendingOrders,
  getPickupOrders,
  getDeliveryOrders,
  getOrderDetails,
  markReadyForPickup,
  markOutForDelivery,
  markOrderCompleted,
  cancelOrderByAdmin,
  updateOrderNotes,
  getOrderStatistics
} from "../controllers/admin-order-controller.js";

const router = express.Router();

// GET ALL ORDERS (with optional filters)
// GET /api/admin/orders?status=pending&deliveryType=pickup
router.get("/orders", getAllOrders);

// GET PENDING ORDERS
// GET /api/admin/orders/pending
router.get("/orders/pending", getPendingOrders);

// GET PICKUP ORDERS
// GET /api/admin/orders/pickup
router.get("/orders/pickup", getPickupOrders);

// GET DELIVERY ORDERS
// GET /api/admin/orders/delivery
router.get("/orders/delivery", getDeliveryOrders);

// GET ORDER STATISTICS
// GET /api/admin/orders/statistics
router.get("/orders/statistics", getOrderStatistics);

// GET SINGLE ORDER DETAILS
// GET /api/admin/orders/:orderId
router.get("/orders/:orderId", getOrderDetails);

// MARK ORDER AS READY FOR PICKUP
// PUT /api/admin/orders/:orderId/ready-for-pickup
router.put("/orders/:orderId/ready-for-pickup", markReadyForPickup);

// MARK ORDER AS OUT FOR DELIVERY
// PUT /api/admin/orders/:orderId/out-for-delivery
router.put("/orders/:orderId/out-for-delivery", markOutForDelivery);

// MARK ORDER AS COMPLETED
// PUT /api/admin/orders/:orderId/complete
router.put("/orders/:orderId/complete", markOrderCompleted);

// CANCEL ORDER (Admin-initiated)
// PUT /api/admin/orders/:orderId/cancel
router.put("/orders/:orderId/cancel", cancelOrderByAdmin);

// UPDATE ORDER NOTES
// PUT /api/admin/orders/:orderId/notes
router.put("/orders/:orderId/notes", updateOrderNotes);

export default router;

