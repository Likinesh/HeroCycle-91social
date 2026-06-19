import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/configuration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Require authentication for all configuration routes
router.use(authenticate);

// Both Admin and Salesperson can access these
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
