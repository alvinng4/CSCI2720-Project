import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    nameE: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    district: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Location ||
  mongoose.model("Location", locationSchema);
