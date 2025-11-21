import Cart from "../models/carts-model.js";
import Product from "../models/product-model.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity)
      return res.status(400).json({ message: "Missing required fields" });

    const qty = Number(quantity);

    let cart = await Cart.findOne({ userId, status: "pending" });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(
      i => i.productId.toString() === productId && !i.removed
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user cart (only active items)
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId, status: "pending" }).populate("items.productId");
    if (!cart) return res.json({ items: [] });

    const activeItems = cart.items.filter(i => !i.removed);
    res.json({ ...cart.toObject(), items: activeItems });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Soft-delete item from cart
export const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId, status: "pending" });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId && !i.removed);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.removed = true;
    await cart.save();

    res.json({ message: "Item removed from cart (soft delete)", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update quantity (only for active items)
export const updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId, status: "pending" });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId && !i.removed);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = Number(quantity);
    await cart.save();
    res.json({ message: "Quantity updated", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Checkout (reduces stock and ignores removed items)
export const checkoutCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ userId, status: "pending" });
    if (!cart) return res.status(400).json({ message: "Cart is empty" });

    const activeItems = cart.items.filter(i => !i.removed);
    if (activeItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const insufficientStock = [];

    for (let item of activeItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        insufficientStock.push({ productId: item.productId, availableStock: product ? product.stock : 0 });
      }
    }

    if (insufficientStock.length > 0)
      return res.status(400).json({ message: "Insufficient stock", insufficientStock });

    // Reduce stock
    for (let item of activeItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    cart.status = "ordered";
    await cart.save();

    res.json({ message: "Checkout successful", cart });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
