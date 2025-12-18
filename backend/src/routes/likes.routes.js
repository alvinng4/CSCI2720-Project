// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import express from "express";

import Like from "../models/Like.js";
import Event from "../models/Event.js";
import requireAuth from "../middleware/require-auth.js";
import User from "../models/User.js";

const router = express.Router();

/* Toggle likes */
router.post("/toggle", requireAuth, async (req, res, next) => {
  try {
    const { user, event, isLike } = req.body;

    if (!user || !event || isLike === null) {
      console.log("user, event and Like are required.");
      return res
        .status(400)
        .json({ error: "user, event and Like are required." });
    }

    const actualUser = await User.findById(user);
    const actualEvent = await Event.findById(event);

    if (!actualUser || !actualEvent) {
      console.log(
        "Failed to find matching user / event data for like in database"
      );
      return res.status(400).json({
        error: "Failed to find matching user / event data for like in database",
      });
    }

    // Check if Like already exists
    const existing = await Like.findOne({ user, event });

    let statusCode = 500;
    let actualIsLike = 0;
    if (existing && isLike) {
      await existing.deleteOne();
      statusCode = 200;
      actualIsLike = false;
    } else if (!existing && !isLike) {
      const like = new Like({ user, event });
      await like.save();
      statusCode = 201;
      actualIsLike = true;
    }

    const numLikes = await Like.countDocuments({ event });
    return res
      .status(Number(statusCode))
      .json({ isLike: actualIsLike, numLikes });
  } catch (e) {
    next(e);
  }
});

export default router;
