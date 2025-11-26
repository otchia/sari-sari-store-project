import Order from "../models/order-model.js";
import Cart from "../models/carts-model.js";
import Product from "../models/product-model.js";
import Customer from "../models/customer-model.js";

// CREATE ORDER / CHECKOUT (AC1, AC3, AC4, AC5, AC6)
export const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      deliveryType,      // "pickup" or "delivery" (AC1)
      paymentMethod,     // "gcash" or "cash" (AC3)
      deliveryAddress,   // Required if deliveryType === "delivery" (AC5)
      deliveryContactNumber, // Required if deliveryType === "delivery" (AC5)
      deliveryNotes,
      customerPhone
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate delivery type (AC1)
    if (!deliveryType || !["pickup", "delivery"].includes(deliveryType)) {
      return res.status(400).json({ 
        message: "Delivery type is required and must be either 'pickup' or 'delivery'" 
      });
    }

    // Validate payment method (AC4)
    if (!paymentMethod || !["gcash", "cash"].includes(paymentMethod)) {
      return res.status(400).json({ 
        message: "Payment method is required and must be either 'gcash' or 'cash'" 
      });
    }

    // Validate delivery-specific fields (AC5, AC6)
    if (deliveryType === "delivery") {
      if (!deliveryAddress || !deliveryContactNumber) {
        return res.status(400).json({ 
          message: "Delivery address and contact number are required for delivery orders" 
        });
      }
    }

    // Get customer information
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get cart items
    const cart = await Cart.findOne({ userId, status: "pending" }).populate("items.productId");
    if (!cart) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter active items
    const activeItems = cart.items.filter(i => !i.removed);
    if (activeItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // Check stock availability
    const insufficientStock = [];
    for (let item of activeItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        insufficientStock.push({ 
          productId: item.productId, 
          productName: product?.name || "Unknown",
          availableStock: product?.stock || 0,
          requestedQuantity: item.quantity
        });
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({ 
        message: "Insufficient stock for some items", 
        insufficientStock 
      });
    }

    // Calculate order details
    let totalAmount = 0;
    const orderItems = activeItems.map(item => {
      const product = item.productId;
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      return {
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        subtotal: subtotal
      };
    });

    // Create order object
    const orderData = {
      customerId: userId,
      customerName: customer.name || "Guest",
      customerEmail: customer.email,
      customerPhone: customerPhone || "",
      items: orderItems,
      totalAmount: totalAmount,
      deliveryType: deliveryType,
      paymentMethod: paymentMethod,
      status: "pending"
    };

    // Add delivery information if delivery type is "delivery"
    if (deliveryType === "delivery") {
      orderData.deliveryAddress = deliveryAddress;
      orderData.deliveryContactNumber = deliveryContactNumber;
      orderData.deliveryNotes = deliveryNotes || "";
    }

    // Create the order
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Reduce product stock
    for (let item of activeItems) {
      await Product.findByIdAndUpdate(
        item.productId, 
        { $inc: { stock: -item.quantity } }
      );
    }

    // Mark cart as ordered
    cart.status = "ordered";
    await cart.save();

    res.status(201).json({ 
      message: "Order placed successfully", 
      order: newOrder 
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// GET ALL ORDERS FOR A CUSTOMER (AC10)
export const getCustomerOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({ orders });

  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// GET SINGLE ORDER DETAILS (AC10, AC11)
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });

  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// GET CUSTOMER NOTIFICATIONS (AC9)
export const getCustomerNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ 
      customerId: userId,
      "notifications.0": { $exists: true } // Only orders with notifications
    }).select("notifications status createdAt");

    const allNotifications = [];
    orders.forEach(order => {
      order.notifications.forEach(notif => {
        allNotifications.push({
          orderId: order._id,
          message: notif.message,
          sentAt: notif.sentAt,
          read: notif.read,
          orderStatus: order.status
        });
      });
    });

    // Sort by most recent
    allNotifications.sort((a, b) => b.sentAt - a.sentAt);

    res.status(200).json({ notifications: allNotifications });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// MARK NOTIFICATIONS AS READ
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Mark all notifications as read
    order.notifications.forEach(notif => {
      notif.read = true;
    });

    await order.save();

    res.status(200).json({ message: "Notifications marked as read" });

  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Error updating notifications", error: error.message });
  }
};

// CANCEL ORDER (Customer-initiated)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership
    if (order.customerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow cancellation if order is still pending
    if (order.status !== "pending") {
      return res.status(400).json({ 
        message: "Order cannot be cancelled at this stage" 
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
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });

  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

