import express from "express";
import {
  getAllChats,
  getChatDetails,
  getChatByCustomerId,
  sendAdminMessage,
  markAdminMessagesAsRead,
  getTotalUnreadCount,
  closeChat,
  reopenChat,
  assignAdminToChat,
  deleteChat,
  getChatStatistics
} from "../controllers/admin-chat-controller.js";

const router = express.Router();

// GET ALL CHATS (Admin Dashboard)
// GET /api/admin/chats?status=active&hasUnread=true
router.get("/chats", getAllChats);

// GET TOTAL UNREAD COUNT (for badge)
// GET /api/admin/chats/unread-count
router.get("/chats/unread-count", getTotalUnreadCount);

// GET CHAT STATISTICS
// GET /api/admin/chats/statistics
router.get("/chats/statistics", getChatStatistics);

// GET CHAT BY CUSTOMER ID
// GET /api/admin/chats/customer/:customerId
router.get("/chats/customer/:customerId", getChatByCustomerId);

// GET CHAT DETAILS WITH FULL MESSAGE HISTORY
// GET /api/admin/chats/:chatId
router.get("/chats/:chatId", getChatDetails);

// SEND MESSAGE (Admin to Customer)
// POST /api/admin/chats/:chatId/send
router.post("/chats/:chatId/send", sendAdminMessage);

// MARK MESSAGES AS READ (Admin side)
// PUT /api/admin/chats/:chatId/read
router.put("/chats/:chatId/read", markAdminMessagesAsRead);

// CLOSE CHAT
// PUT /api/admin/chats/:chatId/close
router.put("/chats/:chatId/close", closeChat);

// REOPEN CHAT
// PUT /api/admin/chats/:chatId/reopen
router.put("/chats/:chatId/reopen", reopenChat);

// ASSIGN ADMIN TO CHAT
// PUT /api/admin/chats/:chatId/assign
router.put("/chats/:chatId/assign", assignAdminToChat);

// DELETE CHAT
// DELETE /api/admin/chats/:chatId
router.delete("/chats/:chatId", deleteChat);

export default router;


