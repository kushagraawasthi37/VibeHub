import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId, // one who is following
      ref: "User",
    },
    Admin: {
      type: Schema.Types.ObjectId, // one to whom 'follower' is following
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "accepted",
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
