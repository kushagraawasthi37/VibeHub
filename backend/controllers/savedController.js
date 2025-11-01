import Saved from "../models/saved.js"; // adjust import path as needed
import mongoose from "mongoose";

// 1. Get total saves count for a post
export const saveCount = async (req, res) => {
  try {
    const { postid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ message: "Invalid postid" });
    }

    const count = await Saved.countDocuments({ post: postid });

    return res.status(200).json({ totalSaves: count });
  } catch (error) {
    console.error("Error getting save count:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 2. Check if the current user has saved the given post (true/false)
export const isSavedByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postid } = req.params;
    let isSaved = false;

    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ message: "Invalid postid" });
    }

    const save = await Saved.findOne({ user: userId, post: postid });
    if (save) {
      isSaved = true;
    }

    return res.status(200).json({ isSaved: isSaved });
  } catch (error) {
    console.error("Error checking saved status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 3. Toggle save/unsave for a post by current user
export const toggleSave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ message: "Invalid postid" });
    }

    const existingSave = await Saved.findOne({ user: userId, post: postid });

    if (existingSave) {
      await Saved.deleteOne({ _id: existingSave._id });
      return res.status(200).json({ message: "Unsaved" });
    } else {
      await Saved.create({ user: userId, post: postid });
      return res.status(200).json({ message: "Saved" });
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
