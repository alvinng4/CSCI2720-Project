import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    titleC: { type: String, required: true, trim: true },
    titleE: { type: String, required: true, trim: true },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    preDateC: { type: String, trim: true },
    preDateE: { type: String, trim: true },

    progTimeC: { type: String, trim: true },
    progTimeE: { type: String, trim: true },

    ageLimitC: { type: String, trim: true },
    ageLimitE: { type: String, trim: true },

    priceC: { type: String, trim: true },
    priceE: { type: String, trim: true },

    descC: { type: String, trim: true },
    descE: { type: String, trim: true },

    urlC: { type: String, trim: true },
    urlE: { type: String, trim: true },

    tAgentUrlC: { type: String, trim: true },
    tAgentUrlE: { type: String, trim: true },

    remarkC: { type: String, trim: true },
    remarkE: { type: String, trim: true },

    enquiry: { type: String, trim: true },
    email: { type: String, trim: true },

    presenterOrgC: { type: String, trim: true },
    presenterOrgE: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
