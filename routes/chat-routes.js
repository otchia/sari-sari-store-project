import express from "express";
import {
  getOrCreateChat,
  getChatHistory,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  deleteChat
} from "../controllers/chat-controller.js";

const router = express.Router();

// GET OR CREATE CHAT
// GET /api/chat/:customerId
router.get("/:customerId", getOrCreateChat);

// GET CHAT HISTORY
// GET /api/chat/:customerId/history
router.get("/:customerId/history", getChatHistory);

// SEND MESSAGE (Customer to Admin)
// POST /api/chat/send
router.post("/send", sendMessage);

// MARK MESSAGES AS READ (Customer side)
// PUT /api/chat/read
router.put("/read", markMessagesAsRead);

// GET UNREAD COUNT
// GET /api/chat/:customerId/unread
router.get("/:customerId/unread", getUnreadCount);

// DELETE CHAT
// DELETE /api/chat/:customerId
router.delete("/:customerId", deleteChat);

export default router;


