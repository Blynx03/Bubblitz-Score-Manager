import express from "express";
import { getLeaderboard, getScores, createScore, deleteScore, updateScore } from '../controllers/scoresController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/", getScores);

router.post("/", protect, adminOnly, createScore);
router.delete("/:id", protect, adminOnly, deleteScore);
router.patch("/:id", protect, adminOnly, updateScore);

export default router;
