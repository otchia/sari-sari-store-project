import Chat from "../models/chat-model.js";
import Admin from "../models/admin-model.js";

// GET ALL CHATS (Admin Dashboard)
export const getAllChats = async (req, res) => {
  try {
    const { status, hasUnread } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (hasUnread === "true") {
      filter.unreadCountAdmin = { $gt: 0 };
    }

    const chats = await Chat.find(filter)
      .sort({ lastMessageAt: -1 }) // Most recent first
      .select('-messages'); // Don't include full message history in list

    res.status(200).json({ 
      chats, 
      count: chats.length 
    });

  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Error fetching chats", error: error.message });
  }
};

// GET CHAT DETAILS WITH FULL MESSAGE HISTORY
export const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get messages with pagination
    const messages = chat.messages
      .slice()
      .reverse()
      .slice(Number(skip), Number(skip) + Number(limit))
      .reverse();

    res.status(200).json({ 
      chat: {
        _id: chat._id,
        customerId: chat.customerId,
        customerName: chat.customerName,
        customerEmail: chat.customerEmail,
        adminName: chat.adminName,
        status: chat.status,
        unreadCountAdmin: chat.unreadCountAdmin,
        lastMessageAt: chat.lastMessageAt,
        lastMessageBy: chat.lastMessageBy,
        relatedOrderId: chat.relatedOrderId,
        messages: messages,
        totalMessages: chat.messages.length,
        createdAt: chat.createdAt
      }
    });

  } catch (error) {
    console.error("Error fetching chat details:", error);
    res.status(500).json({ message: "Error fetching chat details", error: error.message });
  }
};

// GET CHAT BY CUSTOMER ID
export const getChatByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const chat = await Chat.findOne({ customerId });
    if (!chat) {
      return res.status(404).json({ message: "No chat found for this customer" });
    }

    res.status(200).json({ chat });

  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Error fetching chat", error: error.message });
  }
};

// SEND MESSAGE (Admin to Customer)
export const sendAdminMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { adminId, message, attachmentUrl, attachmentType } = req.body;

    if (!adminId || !message) {
      return res.status(400).json({ message: "Admin ID and message are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get admin info
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Assign admin to chat if not already assigned
    if (!chat.adminId) {
      chat.adminId = admin._id;
      chat.adminName = admin.fullName || admin.username;
    }

    // Add message
    const newMessage = {
      senderId: adminId,
      senderType: "admin",
      senderName: admin.fullName || admin.username,
      message: message,
      timestamp: new Date(),
      read: false,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || "none"
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    chat.lastMessageBy = "admin";
    chat.unreadCountCustomer += 1;

    await chat.save();

    // Return the new message
    const savedMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ 
      message: "Message sent successfully", 
      data: savedMessage 
    });

  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// MARK MESSAGES AS READ (Admin side)
export const markAdminMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark all customer messages as read
    let markedCount = 0;
    chat.messages.forEach(msg => {
      if (msg.senderType === "customer" && !msg.read) {
        msg.read = true;
        markedCount++;
      }
    });

    chat.unreadCountAdmin = 0;
    await chat.save();

    res.status(200).json({ 
      message: "Messages marked as read", 
      markedCount 
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error updating messages", error: error.message });
  }
};

// GET TOTAL UNREAD COUNT (for Admin Dashboard badge)
export const getTotalUnreadCount = async (req, res) => {
  try {
    const result = await Chat.aggregate([
      { $match: { status: "active" } },
      { $group: { 
        _id: null, 
        totalUnread: { $sum: "$unreadCountAdmin" },
        chatsWithUnread: { 
          $sum: { $cond: [{ $gt: ["$unreadCountAdmin", 0] }, 1, 0] } 
        }
      }}
    ]);

    const totalUnread = result.length > 0 ? result[0].totalUnread : 0;
    const chatsWithUnread = result.length > 0 ? result[0].chatsWithUnread : 0;

    res.status(200).json({ 
      totalUnread, 
      chatsWithUnread 
    });

  } catch (error) {
    console.error("Error fetching total unread count:", error);
    res.status(500).json({ message: "Error fetching unread count", error: error.message });
  }
};

// CLOSE CHAT
export const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.status = "closed";
    await chat.save();

    res.status(200).json({ 
      message: "Chat closed successfully", 
      chat 
    });

  } catch (error) {
    console.error("Error closing chat:", error);
    res.status(500).json({ message: "Error closing chat", error: error.message });
  }
};

// REOPEN CHAT
export const reopenChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.status = "active";
    await chat.save();

    res.status(200).json({ 
      message: "Chat reopened successfully", 
      chat 
    });

  } catch (error) {
    console.error("Error reopening chat:", error);
    res.status(500).json({ message: "Error reopening chat", error: error.message });
  }
};

// ASSIGN ADMIN TO CHAT
export const assignAdminToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { adminId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    chat.adminId = admin._id;
    chat.adminName = admin.fullName || admin.username;
    await chat.save();

    res.status(200).json({ 
      message: "Admin assigned successfully", 
      chat 
    });

  } catch (error) {
    console.error("Error assigning admin:", error);
    res.status(500).json({ message: "Error assigning admin", error: error.message });
  }
};

// DELETE CHAT (Admin)
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ message: "Chat deleted successfully" });

  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Error deleting chat", error: error.message });
  }
};

// GET CHAT STATISTICS
export const getChatStatistics = async (req, res) => {
  try {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: "active" });
    const closedChats = await Chat.countDocuments({ status: "closed" });
    
    const unreadResult = await Chat.aggregate([
      { $group: { 
        _id: null, 
        totalUnread: { $sum: "$unreadCountAdmin" } 
      }}
    ]);
    const totalUnread = unreadResult.length > 0 ? unreadResult[0].totalUnread : 0;

    const chatsWithUnread = await Chat.countDocuments({ 
      unreadCountAdmin: { $gt: 0 } 
    });

    // Get recent activity (chats with messages in last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await Chat.countDocuments({ 
      lastMessageAt: { $gte: yesterday } 
    });

    res.status(200).json({
      statistics: {
        total: totalChats,
        active: activeChats,
        closed: closedChats,
        totalUnread,
        chatsWithUnread,
        recentActivity24h: recentActivity
      }
    });

  } catch (error) {
    console.error("Error fetching chat statistics:", error);
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};





