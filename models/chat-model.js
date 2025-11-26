import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: String, 
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ["customer", "admin"], 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  // Optional: attach image or file
  attachmentUrl: { 
    type: String 
  },
  attachmentType: { 
    type: String, 
    enum: ["image", "file", "none"],
    default: "none"
  }
});

const chatSchema = new mongoose.Schema({
  // Customer information
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  customerEmail: { 
    type: String, 
    required: true 
  },
  
  // Admin assignment (optional - for assigning specific admin)
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin" 
  },
  adminName: { 
    type: String 
  },
  
  // Messages array
  messages: [messageSchema],
  
  // Last message info
  lastMessage: { 
    type: String 
  },
  lastMessageAt: { 
    type: Date, 
    default: Date.now 
  },
  lastMessageBy: { 
    type: String, 
    enum: ["customer", "admin"] 
  },
  
  // Unread counts
  unreadCountCustomer: { 
    type: Number, 
    default: 0 
  },
  unreadCountAdmin: { 
    type: Number, 
    default: 0 
  },
  
  // Chat status
  status: { 
    type: String, 
    enum: ["active", "closed"], 
    default: "active" 
  },
  
  // Optional: Link to specific order
  relatedOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order" 
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
chatSchema.index({ customerId: 1 });
chatSchema.index({ status: 1, lastMessageAt: -1 });
chatSchema.index({ unreadCountAdmin: 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

