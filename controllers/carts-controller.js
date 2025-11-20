import Cart from "../models/carts-model.js";
import Product from "../models/product-model.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find user's cart (pending)
    let cart = await Cart.findOne({ userId, status: "pending" });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: "pending" }).populate("items.productId");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Checkout
export const checkoutCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ userId, status: "pending" });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const insufficientStock = [];

    // Check stock
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        insufficientStock.push({
          productId: item.productId,
          availableStock: product ? product.stock : 0,
        });
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({ message: "Insufficient stock", insufficientStock });
    }

    // Reduce stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Mark cart as ordered
    cart.status = "ordered";
    await cart.save();

    res.json({ message: "Checkout successful", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
