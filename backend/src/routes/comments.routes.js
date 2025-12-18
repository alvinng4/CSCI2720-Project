// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import Comment from "../models/Comment.js";
import express from "express";
import requireAuth from "../middleware/require-auth.js";
import User from "../models/User.js";
import Location from "../models/Location.js";

const router = express.Router();

/* Create comments */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { content, user, location } = req.body;
    const actualUser = await User.findById(user);
    const actualLocation = await Location.findById(location);

    if (!actualUser || !actualLocation) {
      return res.status(400).json({
        error:
          "Failed to find matching user / location data for comment in database",
      });
    }

    const comment = new Comment({
      content,
      user,
      location,
      createdAt: new Date(),
    });

    await comment.save();
    await comment.populate("user");
    return res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
});

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
