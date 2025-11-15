// routes/google-auth.routes.js
import express from "express";
import { googleLogin, googleRegister } from "../controllers/google-auth.controller.js";

const router = express.Router();

router.post("/google-login", googleLogin);
router.post("/google-register", googleRegister);

export default router;
