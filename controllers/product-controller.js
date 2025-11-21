import Product from "../models/product-model.js";

// Add new product
export const addProduct = async (req, res) => {
  try {
    // Check if Multer uploaded a file
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
      shelfLife,
    } = req.body;

    // Use uploaded image if exists, otherwise fallback to provided URL
    const finalImage = uploadedImage || imageUrl || "";

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
      shelfLife: shelfLife ? new Date(shelfLife) : null,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully!", product: newProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding product." });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Products retrieved successfully", count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while retrieving products." });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found." });
    res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating product." });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found." });
    res.status(200).json({ message: "Product deleted successfully!", deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting product." });
  }
};
