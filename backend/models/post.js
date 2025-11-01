import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  content: {
    type: String,
    trim: true,
  },

  imageContent: {
    type: String, // path or URL
    default: null,
  },

  videoContent: {
    type: String,
    default: null,
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
