import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/admin-routes.js";
import productRoutes from "./routes/product-routes.js";
import customerRoutes from "./routes/customerroutes.js"; // keeping this if still needed

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes); // keeping this if needed

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
