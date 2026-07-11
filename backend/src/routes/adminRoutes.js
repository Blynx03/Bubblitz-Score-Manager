import express from "express";
import { createUser, deleteUser } from "../controllers/adminController.js"
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/users', protect, adminOnly, createUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;