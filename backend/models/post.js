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

  caption: {
    type: String,
    validate: {
      validator: function (value) {
        // Agar image ya video hai to caption zaroori
        if (this.imageContent || this.videoContent) {
          return !!value && value.trim().length > 0;
        }
        return true; // agar nahi hai to koi dikkat nahi
      },
      message: "Caption is required when image or video is present.",
    },
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
