import Favourite from "../models/Favourite.js";
import express from "express";
import requireAuth from "../middleware/require-auth.js";
import User from "../models/User.js";
import Location from "../models/Location.js";

const router = express.Router();

/* Toggle favourites */
router.post("/toggle", requireAuth, async (req, res, next) => {
  try {
    const { user, location, isFavourite } = req.body;

    if (!user || !location || isFavourite === null) {
      console.log("user, location and isFavourite are required.");
      return res
        .status(400)
        .json({ error: "user, location and isFavourite are required." });
    }

    const actualUser = await User.findById(user);
    const actualLocation = await Location.findById(location);

    if (!actualUser || !actualLocation) {
      console.log("Failed to find matching user / location data for favourite in database");
      return res.status(400).json({
        error:
          "Failed to find matching user / location data for favourite in database",
      });
    }

    // Check if favourite already exists
    const existing = await Favourite.findOne({ user, location });

    if (existing && isFavourite) {
      await existing.deleteOne();
      return res.status(200).json({ isFavourite: false });
    } else if (!existing && !isFavourite) {
      const favourite = new Favourite({ user, location });
      await favourite.save();
      return res.status(201).json({ isFavourite: true });
    }
  } catch (e) {
    next(e);
  }
});

export default router;
