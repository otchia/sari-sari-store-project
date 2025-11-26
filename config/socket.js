import { Server } from "socket.io";
import Chat from "../models/chat-model.js";
import Customer from "../models/customer-model.js";
import Admin from "../models/admin-model.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // In production, specify your frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // JOIN CHAT ROOM
    socket.on("join-chat", async (data) => {
      const { customerId, userId, userType } = data;
      
      try {
        // Find or create chat
        let chat = await Chat.findOne({ customerId });
        
        if (!chat && userType === "customer") {
          const customer = await Customer.findById(customerId);
          if (customer) {
            chat = new Chat({
              customerId: customer._id,
              customerName: customer.name || "Guest",
              customerEmail: customer.email,
              messages: []
            });
            await chat.save();
          }
        }

        if (chat) {
          const roomId = chat._id.toString();
          socket.join(roomId);
          console.log(`👤 ${userType} joined chat room: ${roomId}`);
          
          socket.emit("joined-chat", { 
            chatId: chat._id,
            success: true 
          });
        }
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // SEND MESSAGE (Real-time)
    socket.on("send-message", async (data) => {
      const { chatId, senderId, senderType, message, attachmentUrl, attachmentType } = data;

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Get sender information
        let senderName = "Unknown";
        if (senderType === "customer") {
          const customer = await Customer.findById(senderId);
          senderName = customer?.name || "Guest";
        } else if (senderType === "admin") {
          const admin = await Admin.findById(senderId);
          senderName = admin?.fullName || admin?.username || "Admin";
          
          // Assign admin to chat if not already assigned
          if (!chat.adminId) {
            chat.adminId = admin._id;
            chat.adminName = senderName;
          }
        }

        // Create new message
        const newMessage = {
          senderId,
          senderType,
          senderName,
          message,
          timestamp: new Date(),
          read: false,
          attachmentUrl: attachmentUrl || null,
          attachmentType: attachmentType || "none"
        };

        // Add message to chat
        chat.messages.push(newMessage);
        chat.lastMessage = message;
        chat.lastMessageAt = new Date();
        chat.lastMessageBy = senderType;

        // Update unread count
        if (senderType === "customer") {
          chat.unreadCountAdmin += 1;
        } else {
          chat.unreadCountCustomer += 1;
        }

        await chat.save();

        // Get the saved message
        const savedMessage = chat.messages[chat.messages.length - 1];

        // Emit to all users in the chat room
        io.to(chatId).emit("receive-message", {
          chatId: chat._id,
          message: savedMessage,
          unreadCountCustomer: chat.unreadCountCustomer,
          unreadCountAdmin: chat.unreadCountAdmin
        });

        console.log(`💬 Message sent in chat ${chatId} by ${senderType}`);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // TYPING INDICATOR
    socket.on("typing", (data) => {
      const { chatId, userType, isTyping } = data;
      socket.to(chatId).emit("user-typing", { userType, isTyping });
    });

    // MARK MESSAGES AS READ
    socket.on("mark-as-read", async (data) => {
      const { chatId, userType } = data;

      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Mark messages as read based on user type
        if (userType === "customer") {
          chat.messages.forEach(msg => {
            if (msg.senderType === "admin" && !msg.read) {
              msg.read = true;
            }
          });
          chat.unreadCountCustomer = 0;
        } else if (userType === "admin") {
          chat.messages.forEach(msg => {
            if (msg.senderType === "customer" && !msg.read) {
              msg.read = true;
            }
          });
          chat.unreadCountAdmin = 0;
        }

        await chat.save();

        // Notify all users in the room
        io.to(chatId).emit("messages-read", { 
          chatId,
          userType,
          unreadCountCustomer: chat.unreadCountCustomer,
          unreadCountAdmin: chat.unreadCountAdmin
        });

      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark as read" });
      }
    });

    // LEAVE CHAT ROOM
    socket.on("leave-chat", (data) => {
      const { chatId } = data;
      socket.leave(chatId);
      console.log(`👋 User left chat room: ${chatId}`);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

