import Comment from "../models/Comment.js";
import express from "express";
import requireAuth from "../middleware/require-auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { userId, locationId } = req.query;
    const filter = {
      ...(userId && { userId }),
      ...(locationId && { locationId }),
    };
    const comments = await Comment.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json(comments);
  } catch (e) {
    next(e);
  }
});

export default router;
