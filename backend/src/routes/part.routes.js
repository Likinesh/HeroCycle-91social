import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/part.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Require authentication
router.use(authenticate);

// Public (Authenticated users)
router.get("/", getAll);

// Admin only
router.post("/", authorize("ADMIN"), create);
router.patch("/:id", authorize("ADMIN"), update);
router.delete("/:id", authorize("ADMIN"), remove);

export default router;
