import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";

import adminRoutes from "./routes/admin-routes.js";
import productRoutes from "./routes/product-routes.js";
import customerRoutes from "./routes/customer-routes.js";
import googleAuthRoutes from "./routes/google-auth.routes.js";
import storeSettingsRoutes from "./routes/store-settings-routes.js";
import cartRoutes from "./routes/carts-routes.js";
import orderRoutes from "./routes/order-routes.js";
import adminOrderRoutes from "./routes/admin-order-routes.js";
import chatRoutes from "./routes/chat-routes.js";
import adminChatRoutes from "./routes/admin-chat-routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 🔥 IMPORTANT: Serve uploaded files
app.use("/uploads", express.static("uploads"));

// 🔥 REGISTER ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminChatRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customer", googleAuthRoutes);
app.use("/api/store-settings", storeSettingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);


// 🔥 CREATE HTTP SERVER AND INITIALIZE SOCKET.IO
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 Socket.io initialized for real-time chat`);
});
