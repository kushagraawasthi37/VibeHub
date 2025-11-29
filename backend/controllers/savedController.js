import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Saved from "../models/saved.js";
import mongoose from "mongoose";
import Share from "../models/share.js";
import Post from "../models/post.js";

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
    console.log("Page ", req.query.page, " Limit ", req.query.limit);

    const userId = req.user._id;
    const page = Math.max(1, Number(req.query?.page)) || 1;
    const limit = Math.min(10, Number(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    // Step 1 — Fetch saved posts
    const savedDocs = await Saved.find({ user: userId })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "avatar coverImage username privateAccount",
          match: { privateAccount: false },
        },
      })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const posts = savedDocs.map((s) => s.post).filter((p) => p && p.user);

    if (!posts.length) {
      return res.status(200).json({
        message: "No saved content found.",
        posts: [],
        page,
        limit,
        hasMore: false,
      });
    }

    const postIds = posts.map((p) => p._id);
    const userIdsOfPosts = posts.map((p) => p.user._id.toString());

    // Step 2 — Stats + follows
    const [likes, comments, saves, shares, userLikes, userSaves, followData] =
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

        // ⭐ SAME FOLLOW QUERY
        Connection.find({
          follower: userId,
          Admin: { $in: userIdsOfPosts },
          status: "accepted",
        }).select("Admin"),
      ]);

    // Step 3 — Maps
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
      shares.map((s) => [s._id.toString(), s.totalShares])
    );

    const likedPosts = new Set(userLikes.map((l) => l.post.toString()));
    const savedPosts = new Set(userSaves.map((s) => s.post.toString()));
    const followSet = new Set(followData.map((f) => f.Admin.toString()));

    // Step 4 — Merge
    const finalPosts = posts.map((post) => {
      const pid = post._id.toString();
      const uid = post.user._id.toString();

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
        // ⭐ NEW FIELD
        isFollowing: followSet.has(uid),
      };
    });

    const totalSaved = await Saved.countDocuments({ user: userId });
    const totalFetched = skip + posts.length;
    const hasMore = totalFetched < totalSaved;

    return res.status(200).json({
      message: "Saved content loaded successfully 🚀",
      posts: finalPosts,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Saved content error:", error);
    return res.status(500).json({
      message: "Something went wrong. Try again later.",
    });
  }
};
