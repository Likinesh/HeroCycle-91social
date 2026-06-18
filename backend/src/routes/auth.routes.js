import { Router } from "express";
import { registerHandler, loginHandler, meHandler } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authenticate, authorize("ADMIN"), registerHandler);
router.post("/login", loginHandler);
router.get("/me", authenticate, meHandler);

export default router;
