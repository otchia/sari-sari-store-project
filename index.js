import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/admin-routes.js";
import productRoutes from "./routes/product-routes.js";
import customerRoutes from "./routes/customer-routes.js";
import googleAuthRoutes from "./routes/google-auth.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 🔥 IMPORTANT: Serve uploaded files
app.use("/uploads", express.static("uploads"));

// 🔥 REGISTER ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customer", googleAuthRoutes);

// 🔥 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
