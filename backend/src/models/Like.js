import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
