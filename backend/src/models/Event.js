// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

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
