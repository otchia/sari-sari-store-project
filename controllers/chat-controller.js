import Chat from "../models/chat-model.js";
import Customer from "../models/customer-model.js";

// GET OR CREATE CHAT FOR CUSTOMER
export const getOrCreateChat = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ customerId });
    
    if (!chat) {
      chat = new Chat({
        customerId: customer._id,
        customerName: customer.name || "Guest",
        customerEmail: customer.email,
        messages: []
      });
      await chat.save();
    }

    res.status(200).json({ chat });

  } catch (error) {
    console.error("Error getting/creating chat:", error);
    res.status(500).json({ message: "Error accessing chat", error: error.message });
  }
};

// GET CHAT HISTORY
export const getChatHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const chat = await Chat.findOne({ customerId });
    if (!chat) {
      return res.status(404).json({ message: "No chat found" });
    }

    // Get recent messages with pagination
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
        adminName: chat.adminName,
        status: chat.status,
        unreadCountCustomer: chat.unreadCountCustomer,
        lastMessageAt: chat.lastMessageAt,
        messages: messages,
        totalMessages: chat.messages.length
      }
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history", error: error.message });
  }
};

// SEND MESSAGE (Customer to Admin)
export const sendMessage = async (req, res) => {
  try {
    const { customerId, message, attachmentUrl, attachmentType } = req.body;

    if (!customerId || !message) {
      return res.status(400).json({ message: "Customer ID and message are required" });
    }

    // Find or create chat
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let chat = await Chat.findOne({ customerId });
    if (!chat) {
      chat = new Chat({
        customerId: customer._id,
        customerName: customer.name || "Guest",
        customerEmail: customer.email,
        messages: []
      });
    }

    // Add message
    const newMessage = {
      senderId: customerId,
      senderType: "customer",
      senderName: customer.name || "Guest",
      message: message,
      timestamp: new Date(),
      read: false,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || "none"
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    chat.lastMessageBy = "customer";
    chat.unreadCountAdmin += 1;

    await chat.save();

    // Return the new message
    const savedMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ 
      message: "Message sent successfully", 
      data: savedMessage,
      chatId: chat._id
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// MARK MESSAGES AS READ (Customer side)
export const markMessagesAsRead = async (req, res) => {
  try {
    const { customerId } = req.body;

    const chat = await Chat.findOne({ customerId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark all admin messages as read
    let markedCount = 0;
    chat.messages.forEach(msg => {
      if (msg.senderType === "admin" && !msg.read) {
        msg.read = true;
        markedCount++;
      }
    });

    chat.unreadCountCustomer = 0;
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

// GET UNREAD COUNT
export const getUnreadCount = async (req, res) => {
  try {
    const { customerId } = req.params;

    const chat = await Chat.findOne({ customerId });
    if (!chat) {
      return res.status(200).json({ unreadCount: 0 });
    }

    res.status(200).json({ unreadCount: chat.unreadCountCustomer });

  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count", error: error.message });
  }
};

// DELETE CHAT (Customer can delete their chat history)
export const deleteChat = async (req, res) => {
  try {
    const { customerId } = req.params;

    const chat = await Chat.findOneAndDelete({ customerId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ message: "Chat deleted successfully" });

  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Error deleting chat", error: error.message });
  }
};





