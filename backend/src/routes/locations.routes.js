import express from "express";
import Event from "../models/Event.js";
import Location from "../models/Location.js";
import requireAdmin from "../middleware/require-admin.js";
import requireAuth from "../middleware/require-auth.js";

const router = express.Router();

/* Create location */
// router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
//   try {
//     // Check input
//     const { location } = req.body;
//     if (
//       !location.nameC ||
//       !location.nameE ||
//       !location.district ||
//       !location.latitude ||
//       !location.longitude
//     ) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     // Check if location already exist
//     const exists = await Location.findOne({ latitude, longitude });
//     if (exists) return res.status(409).json({ error: "Location exists" });
//     const u = await Location.create({
//       nameE,
//       district,
//       num_events,
//       latitude,
//       longitude,
//       isFavourite,
//     });
//     res.status(201).json({
//       id: u._id,
//       nameE: u.nameE,
//       num_events: u.num_events,
//       latitude: u.latitude,
//       longitude: u.longitude,
//       isFavourite: u.isFavourite,
//     });
//   } catch (e) {
//     next(e);
//   }
// });

/* Read single location */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const loc = await Location.findById(req.params.id).lean();

    if (!loc) {
      return res
        .status(404)
        .json({ error: `Location with id ${req.params.id} not found.` });
    }
    const numEvents = await Event.countDocuments({ venueId: loc._id });
    loc["numEvents"] = numEvents;
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
                    { $eq: ["$user", req.userId] },
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
    res.status(200).json(locations);
  } catch (e) {
    next(e);
  }
});

export default router;
