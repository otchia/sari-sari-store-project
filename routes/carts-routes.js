import express from "express";
import {
  addToCart,
  getCart,
  checkoutCart,
  deleteCartItem,
  updateQuantity
} from "../controllers/carts-controller.js";

const router = express.Router();

router.post("/", addToCart);
router.get("/:userId", getCart);
router.delete("/item", deleteCartItem);
router.patch("/item", updateQuantity);
router.post("/checkout", checkoutCart);

export default router;
