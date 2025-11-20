import express from "express";
import { addToCart, getCart, checkoutCart } from "../controllers/carts-controller.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.post("/checkout", checkoutCart);

export default router;
