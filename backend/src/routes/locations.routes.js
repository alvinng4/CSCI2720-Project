import express from "express";
import Event from "../models/Event.js";
import Favourite from "../models/Favourite.js";
import Location from "../models/Location.js";
import mongoose from "mongoose";
import requireAuth from "../middleware/require-auth.js";
const router = express.Router();

/* Create location */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    // Check input
    const { location } = req.body;
    if (
      !location.nameE ||
      !location.latitude ||
      !location.longitude ||
      !location.district
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const createdLocation = await Location.create(location);
    res.status(201).json(createdLocation);
  } catch (e) {
    next(e);
  }
});

/* Read single location */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const loc = await Location.findById(req.params.id).lean();

    if (!loc) {
      return res
        .status(404)
        .json({ error: `Location with id ${req.params.id} not found.` });
    }

    const numEvents = await Event.countDocuments({ location: loc._id });
    loc["numEvents"] = numEvents;

    const isFavourite = await Favourite.exists({
      location: loc._id,
      user: req.header("x-user-id"),
    });
    loc["isFavourite"] = !!isFavourite;

    res.json({ location: loc });
  } catch (e) {
    next(e);
  }
});

/* Read locations */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const locations = await Location.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "location",
          as: "events",
        },
      },
      {
        $addFields: {
          numEvents: { $size: "$events" },
        },
      },
      {
        $lookup: {
          from: "favourites",
          let: { location: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$location", "$$location"] },
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
          as: "userFavourite",
        },
      },
      {
        $addFields: {
          isFavourite: { $gt: [{ $size: "$userFavourite" }, 0] },
        },
      },
      {
        $project: {
          events: 0,
          userFavourite: 0,
        },
      },
      { $sort: { nameE: 1 } },
    ]);

    return res.status(200).json(locations);
  } catch (e) {
    next(e);
  }
});

/* Update location */
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { nameE, district, latitude, longitude } = req.body;
    const update = {};
    if (nameE) update.nameE = nameE;
    if (district) update.district = district;
    if (latitude) update.latitude = latitude;
    if (longitude) update.longitude = longitude;
    const u = await Location.findByIdAndUpdate(req.params.id, update);
    res.json(u);
  } catch (e) {
    next(e);
  }
});

/* Delete Location */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
