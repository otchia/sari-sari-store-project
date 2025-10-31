import express from "express";
import Product from "../models/product-model.js";

const router = express.Router();

// Add Product Endpoint
router.post("/add", async (req, res) => {
  try {
    const {
      imageUrl,
      category,
      brand,
      name,
      variation,
      price,
      stock,
      description,
      weight,
      shelfLife,
    } = req.body;

    // Validate required fields
    if (!imageUrl || !category || !brand || !name || !price || !stock || !weight) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newProduct = new Product({
      imageUrl,
      category,
      brand,
      name,
      variation,
      price: parseFloat(price.toFixed(2)), // 2 decimal places
      stock: parseInt(stock),
      description,
      weight: parseFloat(weight.toFixed(2)), // 2 decimal places
      shelfLife: shelfLife ? new Date(shelfLife) : null,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding product." });
  }
});

// Update Product Endpoint
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,      // return the updated product
      runValidators: true, // recheck schema validation
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating product." });
  }
});

// Delete Product Endpoint
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Try to delete by ID
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product deleted successfully!",
      deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting product." });
  }
});

// GET all products with optional sorting
router.get("/", async (req, res) => {
  try {
    // Get sorting query from URL (example: ?sort=name or ?sort=category)
    const sortBy = req.query.sort || "name"; // default = alphabetical by name
    let sortOptions = {};

    if (sortBy === "name") {
      sortOptions = { name: 1 }; // 1 = ascending order (A–Z)
    } else if (sortBy === "category") {
      sortOptions = { category: 1 };
    } else if (sortBy === "date") {
      sortOptions = { createdAt: -1 }; // newest first
    }

    const products = await Product.find().sort(sortOptions);

    res.status(200).json({
      message: `Products sorted by ${sortBy}`,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while retrieving products." });
  }
});

export default router;