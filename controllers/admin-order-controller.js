import Order from "../models/order-model.js";
import Product from "../models/product-model.js";

// GET ALL ORDERS (AC7, AC11)
export const getAllOrders = async (req, res) => {
  try {
    const { status, deliveryType } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (deliveryType) {
      filter.deliveryType = deliveryType;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({ orders, count: orders.length });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// GET PENDING ORDERS (AC7)
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .sort({ createdAt: -1 });

    res.status(200).json({ orders, count: orders.length });

  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ message: "Error fetching pending orders", error: error.message });
  }
};

// GET PICKUP ORDERS (AC7)
export const getPickupOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      deliveryType: "pickup",
      status: { $in: ["pending", "ready_for_pickup"] }
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders, count: orders.length });

  } catch (error) {
    console.error("Error fetching pickup orders:", error);
    res.status(500).json({ message: "Error fetching pickup orders", error: error.message });
  }
};

// GET DELIVERY ORDERS
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      deliveryType: "delivery",
      status: { $in: ["pending", "out_for_delivery"] }
    }).sort({ createdAt: -1 });

    res.status(200).json({ orders, count: orders.length });

  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ message: "Error fetching delivery orders", error: error.message });
  }
};

// GET SINGLE ORDER DETAILS (AC11)
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });

  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Error fetching order details", error: error.message });
  }
};

// MARK ORDER AS READY FOR PICKUP (AC8, AC9)
export const markReadyForPickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify it's a pickup order
    if (order.deliveryType !== "pickup") {
      return res.status(400).json({ 
        message: "This action is only for pickup orders" 
      });
    }

    // Verify it's in pending status
    if (order.status !== "pending") {
      return res.status(400).json({ 
        message: "Order must be in pending status" 
      });
    }

    // Update status
    order.status = "ready_for_pickup";
    
    // Add admin notes if provided
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Add notification for customer (AC9)
    order.notifications.push({
      message: `Your order #${order._id.toString().slice(-6)} is ready for pickup! Please collect it at your earliest convenience.`,
      sentAt: new Date(),
      read: false
    });

    await order.save();

    res.status(200).json({ 
      message: "Order marked as ready for pickup and customer notified", 
      order 
    });

  } catch (error) {
    console.error("Error marking order as ready:", error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

// MARK ORDER AS OUT FOR DELIVERY
export const markOutForDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify it's a delivery order
    if (order.deliveryType !== "delivery") {
      return res.status(400).json({ 
        message: "This action is only for delivery orders" 
      });
    }

    // Verify it's in pending status
    if (order.status !== "pending") {
      return res.status(400).json({ 
        message: "Order must be in pending status" 
      });
    }

    // Update status
    order.status = "out_for_delivery";
    
    // Add admin notes if provided
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Add notification for customer
    order.notifications.push({
      message: `Your order #${order._id.toString().slice(-6)} is out for delivery! It will arrive soon.`,
      sentAt: new Date(),
      read: false
    });

    await order.save();

    res.status(200).json({ 
      message: "Order marked as out for delivery and customer notified", 
      order 
    });

  } catch (error) {
    console.error("Error marking order as out for delivery:", error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

// MARK ORDER AS COMPLETED (AC10)
export const markOrderCompleted = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Can only complete orders that are ready or out for delivery
    if (!["ready_for_pickup", "out_for_delivery"].includes(order.status)) {
      return res.status(400).json({ 
        message: "Order must be ready for pickup or out for delivery to be completed" 
      });
    }

    // Update status
    order.status = "completed";
    order.completedAt = new Date();
    
    // Add admin notes if provided
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Add notification for customer (AC10)
    order.notifications.push({
      message: `Your order #${order._id.toString().slice(-6)} has been completed. Thank you for your purchase!`,
      sentAt: new Date(),
      read: false
    });

    await order.save();

    res.status(200).json({ 
      message: "Order marked as completed", 
      order 
    });

  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Error completing order", error: error.message });
  }
};

// CANCEL ORDER (Admin-initiated)
export const cancelOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Cannot cancel completed orders
    if (order.status === "completed") {
      return res.status(400).json({ 
        message: "Cannot cancel completed orders" 
      });
    }

    // Restore product stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId, 
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = "cancelled";
    order.adminNotes = adminNotes || reason || "Cancelled by admin";

    // Add notification for customer
    const cancellationReason = reason || "your order has been cancelled";
    order.notifications.push({
      message: `Order #${order._id.toString().slice(-6)} has been cancelled. Reason: ${cancellationReason}`,
      sentAt: new Date(),
      read: false
    });

    await order.save();

    res.status(200).json({ 
      message: "Order cancelled successfully", 
      order 
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

// UPDATE ORDER NOTES
export const updateOrderNotes = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.adminNotes = adminNotes;
    await order.save();

    res.status(200).json({ 
      message: "Order notes updated", 
      order 
    });

  } catch (error) {
    console.error("Error updating order notes:", error);
    res.status(500).json({ message: "Error updating order notes", error: error.message });
  }
};

// GET ORDER STATISTICS
export const getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const readyForPickup = await Order.countDocuments({ status: "ready_for_pickup" });
    const outForDelivery = await Order.countDocuments({ status: "out_for_delivery" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    const pickupOrders = await Order.countDocuments({ deliveryType: "pickup" });
    const deliveryOrders = await Order.countDocuments({ deliveryType: "delivery" });

    const gcashPayments = await Order.countDocuments({ paymentMethod: "gcash" });
    const cashPayments = await Order.countDocuments({ paymentMethod: "cash" });

    // Calculate total revenue (completed orders only)
    const revenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      statistics: {
        total: totalOrders,
        pending: pendingOrders,
        readyForPickup,
        outForDelivery,
        completed: completedOrders,
        cancelled: cancelledOrders,
        pickup: pickupOrders,
        delivery: deliveryOrders,
        gcashPayments,
        cashPayments,
        totalRevenue
      }
    });

  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};

