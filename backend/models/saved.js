import mongoose, { Schema } from "mongoose";

const savedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

const Saved = mongoose.models.Saved || mongoose.model("Saved", savedSchema);
export default Saved;
