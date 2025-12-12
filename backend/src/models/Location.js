import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    sourceId: { type: Number, required: true, unique: true },
    nameC: { type: String, required: true, trim: true },
    nameE: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    district: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Location ||
  mongoose.model("Location", locationSchema);
