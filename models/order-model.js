import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  // Customer information
  customerId: { 
    type: String, 
    required: true 
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },

  // Order items
  items: [orderItemSchema],
  
  // Order totals
  totalAmount: { type: Number, required: true },
  
  // Delivery type: "pickup" or "delivery" (AC1)
  deliveryType: { 
    type: String, 
    enum: ["pickup", "delivery"], 
    required: true 
  },
  
  // Delivery information (AC5, AC6)
  deliveryAddress: { 
    type: String, 
    required: function() { 
      return this.deliveryType === "delivery"; 
    } 
  },
  deliveryContactNumber: { 
    type: String, 
    required: function() { 
      return this.deliveryType === "delivery"; 
    } 
  },
  deliveryNotes: { type: String },
  
  // Payment method: "gcash" or "cash" (AC3, AC4, AC11)
  paymentMethod: { 
    type: String, 
    enum: ["gcash", "cash"], 
    required: true 
  },
  
  // Order status (AC2, AC7, AC8, AC10)
  status: { 
    type: String, 
    enum: [
      "pending",           // Initial state for all orders
      "ready_for_pickup",  // For pickup orders marked as ready
      "out_for_delivery",  // For delivery orders being delivered
      "completed",         // Order completed
      "cancelled"          // Order cancelled
    ], 
    default: "pending" 
  },
  
  // Notification tracking (AC9)
  notifications: [{
    message: String,
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  
  // Admin notes
  adminNotes: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;


