import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import partRoutes from "./part.routes.js";
import configurationRoutes from "./configuration.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Hero Cycles Pricing Engine is running" });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/parts", partRoutes);
router.use("/configurations", configurationRoutes);

export default router;