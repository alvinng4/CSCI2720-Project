import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);
