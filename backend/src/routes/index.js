import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Hero Cycles Pricing Engine is running" });
});

router.use("/auth", authRoutes);

export default router;