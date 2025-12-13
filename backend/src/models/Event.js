import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    titleE: { type: String, required: true, trim: true },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    preDateE: { type: String, trim: true },
    progTimeE: { type: String, trim: true },
    priceE: { type: String, trim: true },
    descE: { type: String, trim: true },
    presenterOrgE: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
