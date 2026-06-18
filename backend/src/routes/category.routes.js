import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication to all category routes
router.use(authenticate);

// Public (Authenticated)
router.get("/", getAll);

// Admin Only
router.post("/", authorize("ADMIN"), create);
router.patch("/:id", authorize("ADMIN"), update);
router.delete("/:id", authorize("ADMIN"), remove);

export default router;
