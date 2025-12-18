// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import express from "express";
import Event from "../models/Event.js";
import mongoose from "mongoose";
import Location from "../models/Location.js";
import requireAdmin from "../middleware/require-admin.js";
import requireAuth from "../middleware/require-auth.js";
const router = express.Router();

/* Create Event */
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Check input
    const { event } = req.body;
    const location = event?.location;
    if (!event?.titleE || !location) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Validate location ObjectId
    if (!mongoose.Types.ObjectId.isValid(location)) {
      return res.status(400).json({ error: "Invalid location ID" });
    }

    // Check if location exists
    const locationExists = await Location.findById(location).lean();
    if (!locationExists) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Convert location to ObjectId
    event.location = mongoose.Types.ObjectId.createFromHexString(location);

    const createdEvent = await Event.create(event);
    res.status(201).json(createdEvent);
  } catch (e) {
    next(e);
  }
});

/* Read single event */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Missing event Id" });
    }

    const event = await Event.findById(id).populate("location").lean();
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({ event: event });
  } catch (e) {
    next(e);
  }
});

/* Read events */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "likes",
          let: { event: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$event", "$$event"] },
                    {
                      $eq: [
                        "$user",
                        mongoose.Types.ObjectId.createFromHexString(
                          req.header("x-user-id")
                        ),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "userLike",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "event",
          as: "allLikes",
        },
      },
      {
        $addFields: {
          isLike: { $gt: [{ $size: "$userLike" }, 0] },
          numLikes: { $size: "$allLikes" },
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "location",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $unwind: {
          path: "$location",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          userLike: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    return res.status(200).json(events);
  } catch (e) {
    next(e);
  }
});

/* Update event */
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Missing event id" });
    }

    // Check input
    const { event } = req.body;
    const location = event?.location;
    if (event?.titleE === "") {
      return res
        .status(400)
        .json({ error: "Event title cannot be changed to empty" });
    }

    if (location) {
      if (location === "") {
        return res
          .status(400)
          .json({ error: "Event location cannot be changed to empty" });
      }

      // Validate location ObjectId
      if (!mongoose.Types.ObjectId.isValid(location)) {
        return res.status(400).json({ error: "Invalid location ID" });
      }

      // Check if location exists
      const locationExists = await Location.findById(location).lean();
      if (!locationExists) {
        return res.status(404).json({ error: "Location not found" });
      }

      // Convert location to ObjectId
      event.location = mongoose.Types.ObjectId.createFromHexString(location);
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, event, {
      new: true,
      runValidators: true,
    }).populate("location");

    if (!updatedEvent) {
      return res.status(404).json({ error: "Some error occurred" });
    }
    return res.status(200).json({ event: updatedEvent });
  } catch (e) {
    next(e);
  }
});

/* Delete event */
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
