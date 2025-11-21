import Product from "../models/product-model.js";

// Add product
export const addProduct = async (req, res) => {
  try {
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

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
      shelfLife
    } = req.body;

    const finalImage = uploadedImage || imageUrl;

    if (!finalImage || !category || !brand || !name || !price || !stock || !weight) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newProduct = new Product({
      imageUrl: finalImage,
      category,
      brand,
      name,
      variation,
      price,
      stock,
      description,
      weight,
      shelfLife: shelfLife ? new Date(shelfLife) : null
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully!",
      product: newProduct
    });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error while adding product." });
  }
};

// Get all products (excluding soft-deleted)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Products retrieved successfully",
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ message: "Server error while retrieving products." });
  }
};

// Get one product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product found", product });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ message: "Server error while retrieving product." });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found or already deleted." });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      product
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error while updating product." });
  }
};

// Soft delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found or already deleted." });
    }

    res.status(200).json({
      message: "Product soft-deleted successfully!",
      product
    });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error while deleting product." });
  }
};
