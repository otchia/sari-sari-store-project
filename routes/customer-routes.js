import express from "express";
import { googleLogin } from "../controllers/customer-controller.js";

const router = express.Router();

router.post("/login", googleLogin);

export default router;