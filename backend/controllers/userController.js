import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.js";
import Post from "../models/post.js";
import Like from "../models/like.js";
import Connection from "../models/connection.js";
import Saved from "../models/Saved.js";
import Share from "../models/share.js";
import Comment from "../models/comment.js";

// search user
export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.body.username.trim();

    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const users = await User.find({
      username: { $regex: escapeRegex(searchTerm), $options: "i" },
    }).select("username name age avatar");

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: `No results for "${searchTerm}"`,
        users: [],
      });
    }

    res.json({ success: true, users });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// VIEW OTHER USER PROFILE
export const viewOtherProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("username name age avatar coverImage")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch posts separately with sorting and user populated
    const posts = await Post.find({ user: user._id })
      .select("content fileContent likes user date")
      .populate({ path: "user", select: "username avatar" })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      user: { ...user, posts: posts || [] },
    });
  } catch (err) {
    console.error("View profile error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// feed page Logged In
export const getFeedLoggedIn = async (req, res) => {
  try {
    console.log("Page ", req.query.page, " Limit ", req.query.limit);

    const userId = req.user?._id;
    const page = Math.max(1, Number(req.query?.page)) || 1;
    const limit = Math.min(10, Number(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    // Step 1️⃣ — Fetch paginated posts with video content only + populate basic user info
    let posts = await Post.find({ videoContent: { $ne: null } })
      .populate({
        path: "user",
        select: "avatar coverImage username privateAccount",
        match: { privateAccount: false },
      })
      .sort({ createdAt: -1, _id: -1 }) // tiebreaker with _id
      .skip(skip)
      .limit(limit)
      .lean();

    posts = posts.filter((post) => post.user !== null); // filter deleted/private users
    const postIds = posts.map((p) => p._id);

    // Step 2️⃣ — Bulk fetch all stats
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

    // Step 3️⃣ — Convert stats to lookup maps
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

    // Step 4️⃣ — Merge stats into posts
    const finalPosts = posts.map((post) => {
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

    // Step 5️⃣ — Pagination info
    const totalPosts = await Post.countDocuments({
      videoContent: { $ne: null },
    });
    const totalFetched = skip + posts.length;
    const hasMore = totalFetched < totalPosts;

    return res.status(200).json({
      message: "Video feed loaded successfully 🚀",
      posts: finalPosts,
      page,
      limit,
      hasMore,
    });
  } catch (err) {
    console.error("Video feed load error:", err);
    return res.status(500).json({
      message: "Something went wrong. Try again later.",
    });
  }
};

//Home page
export const getHomeLoggedIn = async (req, res) => {
  try {
    console.log("Home Hit Personal");
    console.log(req.query);

    //Jo bhi humko params se data milega wo string mai hoga wo pahele Number mai change kro
    const userId = req.user?._id;
    const page = Math.max(1, Number(req.query?.page)) || 1;
    const limit = Math.min(10, Number(req.query.limit)) || 10; // max 10 posts per page
    const skip = (page - 1) * limit;

    // Step 1️⃣ — Fetch paginated public posts + populate basic user info
    let posts = await Post.find()
      .populate({
        path: "user",
        select: "avatar coverImage username privateAccount",
        match: { privateAccount: false },
      })
      .sort({ createdAt: -1, _id: -1 }) // Add _id as a tiebreaker
      .skip(skip)
      .limit(limit)
      .lean();

    posts = posts.filter((post) => post.user !== null);

    const postIds = posts.map((p) => p._id);

    // Step 2️⃣ — Bulk fetch all stats
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

    // Step 3️⃣ — Convert stats to lookup maps
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

    // Step 4️⃣ — Merge stats into posts
    const finalPosts = posts.map((post) => {
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

    // Step 5️⃣ — Return paginated response including page info
    // Step 5️⃣ — Return paginated response including page info
    const totalPosts = await Post.countDocuments();
    const totalFetched = skip + posts.length;
    finalPosts.forEach((item) => {
      console.log(item._id);
    });

    let hasMore = totalFetched < totalPosts;
    console.log(hasMore);
    return res.status(200).json({
      message: "Home feed loaded successfully 🚀",
      posts: finalPosts,
      page,
      limit,
      hasMore, // ✅ accurate check
    });
  } catch (err) {
    console.error("Home load error:", err);
    return res.status(500).json({
      message: "Something went wrong. Try again later.",
    });
  }
};

//Maintain privacy
export const privacy = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    user.privateAccount = !user.privateAccount;
    await user.save();

    return res.status(200).json({
      message: "Privacy setting updated successfully",
      privateAccount: user.privateAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating privacy" });
  }
};

//Get current user
export const currentUser = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong.Try again later");
  }
};

//Get current user by id
export const currentUserById = async (req, res) => {
  try {
    const { userid } = req.params;
    // console.log(user.username);
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userid);

    if (!user) {
      return res.status(403).json({ message: "Can't find user" });
    }
    return res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong.Try again later");
  }
};

//All Video post of user
export const userAllVideoPost = async (req, res) => {
  try {
    const { adminid } = req.params;
    if (!adminid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let posts = await Post.find({
      user: adminid,
      videoContent: { $ne: null },
    })
      .populate({
        path: "user",
        select: "avatar coverImage username privateAccount",
        match: { privateAccount: false },
      })
      .sort({ createdAt: -1 });

    posts = posts.filter((post) => post.user !== null);
    return res.status(200).json({
      message: "All public posts with video fetched successfully",
      posts,
    });
  } catch (err) {
    console.error("Feed load error:", err);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

//All Post of user
export const userAllPost = async (req, res) => {
  try {
    const { adminid } = req.params;
    let posts = await Post.find({
      user: adminid,
    })
      .populate({
        path: "user",
        select: "avatar coverImage username privateAccount",
        match: { privateAccount: false },
      })
      .sort({ createdAt: -1 });

    posts = posts.filter((post) => post.user !== null);
    return res.status(200).json({
      message: "All public posts with video fetched successfully",
      posts,
    });
  } catch (err) {
    console.error("Feed load error:", err);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

//Is current user is owner of page
export const isCurrentUserIsOwner = async (req, res) => {
  try {
    const { adminid } = req.params;
    const userId = req.user._id;

    // console.log("User id ", userId);
    // console.log("Admin id ", adminid);

    // Safely convert both to strings and compare
    const isOwner = adminid?.toString() === userId.toString();

    return res.status(200).json(isOwner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
};

//Updating user details
export const updateDetails = async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(userid);

    if (!user) {
      return res.status(403).json({ message: "Login Again" });
    }

    const { name, bio } = req.body;
    const avatar = req.file;
    // console.log("hit");

    if (!avatar && !name?.trim() && !bio?.trim()) {
      return res.status(401).json({
        message: "Atleast one field  required",
      });
    }

    if (bio) {
      user.bio = bio;
    }
    if (name) {
      user.name = name;
    }

    if (avatar) {
      const uploaded = await uploadOnCloudinary(avatar.path);
      user.avatar = uploaded.secure_url;
    }

    await user.save();

    return res.status(200).json({
      message: "User details updated",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Details updating failed.Try again later",
    });
  }
};

// delete account permanently
export const deleteAccountAction = async (req, res) => {
  try {
    const user = req.user;

    const { userid } = req.params;
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const owner = await User.findById(userid);

    if (!owner || owner._id.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only owner can delete the account" });
    }

    const { confirmCheck, confirmText, confirmUserName } = req.body;
    if (confirmUserName != user.username) {
      return res
        .status(400)
        .json({ message: "You must fill correct details to confirm deletion" });
    }

    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) return res.status(404).send("User not found");

    await Post.deleteMany({ user: deletedUser._id });
    await Like.deleteMany({ likedBy: deletedUser._id });
    await Comment.deleteMany({ owner: deletedUser._id });
    await Saved.deleteMany({ user: deletedUser._id });
    await Connection.deleteMany({
      $or: [{ follower: deletedUser._id }, { Admin: deletedUser._id }],
    });

    return res
      .status(200)
      .json({ message: "Account and all your posts deleted successfully." });
  } catch (err) {
    console.error("Delete account action error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong.Try again later" });
  }
};

// ✅ getOtherUsers.js
export const getOtherUsers = async (req, res) => {
  try {
    const otherUsers = await User.find({ _id: { $ne: req.user._id } });
    res.status(200).json({
      message: "Other users fetched successfully",
      otherUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};
