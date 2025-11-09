import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Saved from "../models/saved.js";
import mongoose from "mongoose";
import Share from "../models/share.js";

// 2. Check if the current user has saved the given post (true/false)
export const isSavedByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postid } = req.params;
    if (!postid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
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
    if (!postid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

export const userSavedContent = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1️⃣ — Fetch all saved posts by this user
    const savedDocs = await Saved.find({ user: userId })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "avatar coverImage username privateAccount",
          match: { privateAccount: false },
        },
      })
      .lean();

    // Step 2️⃣ — Filter out private or deleted posts
    const posts = savedDocs.map((s) => s.post).filter((p) => p && p.user);

    if (!posts.length) {
      return res.status(200).json({
        message: "No saved content found.",
        savedContent: [],
      });
    }

    const postIds = posts.map((p) => p._id);

    // Step 3️⃣ — Bulk fetch stats (just like home feed)
    const [likes, comments, saves, shares, userLikes, userSaves] =
      await Promise.all([
        Like.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: "$post", totalLikes: { $sum: 1 } } },
        ]),
        Comment.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: "$post", totalComments: { $sum: 1 } } },
        ]),
        Saved.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: "$post", totalSaves: { $sum: 1 } } },
        ]),
        Share.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: "$post", totalShares: { $sum: 1 } } },
        ]),
        Like.find({ likedBy: userId, post: { $in: postIds } }).select("post"),
        Saved.find({ user: userId, post: { $in: postIds } }).select("post"),
      ]);

    // Step 4️⃣ — Build lookup maps
    const likeMap = Object.fromEntries(
      likes.map((l) => [l._id.toString(), l.totalLikes])
    );
    const commentMap = Object.fromEntries(
      comments.map((c) => [c._id.toString(), c.totalComments])
    );
    const saveMap = Object.fromEntries(
      saves.map((s) => [s._id.toString(), s.totalSaves])
    );
    const shareMap = Object.fromEntries(
      shares.map((sh) => [sh._id.toString(), sh.totalShares])
    );
    const likedPosts = new Set(userLikes.map((l) => l.post.toString()));
    const savedPosts = new Set(userSaves.map((s) => s.post.toString()));

    // Step 5️⃣ — Merge stats into posts
    const finalSaved = posts.map((post) => {
      const pid = post._id.toString();
      return {
        ...post,
        stats: {
          likes: likeMap[pid] || 0,
          comments: commentMap[pid] || 0,
          saves: saveMap[pid] || 0,
          shares: shareMap[pid] || 0,
          isLiked: likedPosts.has(pid),
          isSaved: savedPosts.has(pid),
        },
      };
    });

    // Step 6️⃣ — Return formatted result
    return res.status(200).json({
      message: "All saved content fetched successfully with stats 🚀",
      savedContent: finalSaved,
    });
  } catch (error) {
    console.error("Saved content error:", error);
    return res.status(500).json({
      message: "Something went wrong. Try again later.",
    });
  }
};
