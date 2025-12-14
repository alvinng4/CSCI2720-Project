import express from "express";
import Event from "../models/Event.js";
import mongoose from "mongoose";
import Location from "../models/Location.js";
import requireAuth from "../middleware/require-auth.js";
const router = express.Router();

/* Create Event */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    // Check input
    const { event } = req.body;
    if (!event.titleE || !event.location) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Validate location ObjectId
    if (!mongoose.Types.ObjectId.isValid(event.location)) {
      return res.status(400).json({ error: "Invalid location ID" });
    }

    // Check if location exists
    const locationExists = await Location.findById(event.location);
    if (!locationExists) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Convert location to ObjectId
    event.location = mongoose.Types.ObjectId.createFromHexString(
      event.location
    );

    const createdEvent = await Event.create(event);
    res.status(201).json(createdEvent);
  } catch (e) {
    next(e);
  }
});

/* Read single location */
// router.get("/:id", requireAuth, async (req, res, next) => {
//   try {
//     const loc = await Location.findById(req.params.id).lean();

//     if (!loc) {
//       return res
//         .status(404)
//         .json({ error: `Location with id ${req.params.id} not found.` });
//     }

//     const numEvents = await Event.countDocuments({ location: loc._id });
//     loc["numEvents"] = numEvents;

//     const isFavourite = await Favourite.exists({
//       location: loc._id,
//       user: req.header("x-user-id"),
//     });
//     loc["isFavourite"] = !!isFavourite;

//     res.json({ location: loc });
//   } catch (e) {
//     next(e);
//   }
// });

/* Read events */
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const events = await Event.find().populate("location");
    return res.status(200).json(events);
  } catch (e) {
    next(e);
  }
});

/* Update location */
// router.put("/:id", requireAuth, async (req, res, next) => {
//   try {
//     const { nameE, district, latitude, longitude } = req.body;
//     const update = {};
//     if (nameE) update.nameE = nameE;
//     if (district) update.district = district;
//     if (latitude) update.latitude = latitude;
//     if (longitude) update.longitude = longitude;
//     const u = await Location.findByIdAndUpdate(req.params.id, update);
//     res.json(u);
//   } catch (e) {
//     next(e);
//   }
// });

/* Delete event */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* Update event */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // Frontend sends { event: { ...fields } }
    const payload = req.body?.event ?? req.body ?? {};
    if (!id) return res.status(400).json({ message: "Missing event id" });

    const updated = await Event.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch (e) {
    console.error("Update event failed:", e);
    res.status(500).json({ message: "Server error updating event" });
  }
});



export default router;

