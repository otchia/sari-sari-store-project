import express from "express";
import {
  addToCart,
  getCart,
  checkoutCart,
  deleteCartItem,
  updateQuantity
} from "../controllers/carts-controller.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.post("/delete", deleteCartItem);
router.post("/update", updateQuantity);
router.post("/checkout", checkoutCart);

export default router;
