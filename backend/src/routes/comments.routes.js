import Comment from "../models/Comment.js";
import express from "express";
import requireAuth from "../middleware/require-auth.js";

const router = express.Router();

/* Read comments */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { user, location } = req.query;
    const filter = {
      ...(user && { user }),
      ...(location && { location }),
    };

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .populate("user")
      .lean();
    res.status(200).json(comments);
  } catch (e) {
    next(e);
  }
});

export default router;
