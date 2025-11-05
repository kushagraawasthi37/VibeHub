// controllers/profileController.js
import userModel from "../models/user.js";
import postModel from "../models/post.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.js";
import Post from "../models/post.js";
import Like from "../models/like.js";
import Connection from "../models/connection.js";
import Comment from "../models/comment.js";
import Saved from "../models/saved.js";

// search user
export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.body.username.trim();

    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const users = await userModel
      .find({
        username: { $regex: escapeRegex(searchTerm), $options: "i" },
      })
      .select("username name age avatar");

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
    const user = await userModel
      .findOne({ username: req.params.username })
      .select("username name age avatar coverImage")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch posts separately with sorting and user populated
    const posts = await postModel
      .find({ user: user._id })
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

//Updated routes

// feed page
export const getFeed = async (req, res) => {
  try {
    let posts = await Post.find({ videoContent: { $ne: null } })
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

//Home page
export const getHome = async (req, res) => {
  try {
    let posts = await Post.find()
      .populate({
        path: "user",
        select: "avatar coverImage username privateAccount",
        match: { privateAccount: false },
      })
      .sort({ createdAt: -1 });

    posts = posts.filter((post) => post.user !== null);

    return res.status(200).json({
      message: "All public posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.error("Home load error:", err);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
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
    const userId = req.user._id;
    // console.log(user.username);

    const user = await User.findById(userId);

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

    const deletedUser = await userModel.findByIdAndDelete(user._id);
    if (!deletedUser) return res.status(404).send("User not found");

    await postModel.deleteMany({ user: deletedUser._id });
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
