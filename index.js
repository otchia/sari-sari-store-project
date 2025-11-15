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

// ✅ CORS middleware
// allow your frontend origin (Flutter web runs usually on http://localhost:5000 or 5173)
app.use(cors({
  origin: "http://localhost:5000", // replace with your Flutter web URL
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(bodyParser.json());

// 🔥 Register routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customer", googleAuthRoutes); 

// 🔥 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
