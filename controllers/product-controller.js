import Product from "../models/product-model.js";

// Add new product
export const addProduct = async (req, res) => {
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

    if (!imageUrl || !category || !brand || !name || !price || !stock || !weight) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newProduct = new Product({
      imageUrl,
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

// Get all
export const getAllProducts = async (req, res) => {
  try {
    const sortBy = req.query.sort || "name";

    const sortOptions =
      sortBy === "category" ? { category: 1 } :
      sortBy === "date" ? { createdAt: -1 } :
      { name: 1 };

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
};

// Update
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating product." });
  }
};

// Delete
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
