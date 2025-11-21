import express from "express";
import { upload } from "../middleware/upload.js";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product-controller.js";

const router = express.Router();

// Image upload endpoint
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

router.post("/add", addProduct);
router.get("/", getAllProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;