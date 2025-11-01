// controllers/profileController.js
import userModel from "../models/user.js";
import postModel from "../models/post.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.js";
import Post from "../models/post.js";

// -------- PROFILE PAGE --------
export const getProfile = async (req, res) => {
  try {
    const populatedUser = await userModel
      .findById(req.user._id)
      .populate({
        path: "posts",
        select: "content fileContent likes user date",
        options: { sort: { date: -1 } }, // newest posts first
        populate: { path: "user", select: "username avatar" },
      })
      .lean();

    res.render("profile", {
      user: populatedUser,
      success_msg: res.locals.success_msg,
      error_msg: res.locals.error_msg,
      message: res.locals.message,
    });
  } catch (err) {
    console.error("Profile load error:", err);
    req.flash("error_msg", "Something went wrong. Please log in again.");
    res.redirect("/login");
  }
};

// -------- SEARCH PAGE --------
export const searchPage = (req, res) => res.render("search-user");

// -------- SEARCH USERS --------
export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.body.username.trim();
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const users = await userModel.find({
      username: { $regex: escapeRegex(searchTerm), $options: "i" },
    });

    if (!users.length) {
      return res.render("search-user", {
        message: `No results for "${searchTerm}"`,
      });
    }

    res.render("search-user", { users });
  } catch (err) {
    console.error("Search error:", err);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/search/user");
  }
};

// -------- VIEW OTHER USER PROFILE --------
export const viewOtherProfile = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ username: req.params.username })
      .select("username name age avatar coverImage posts")
      .populate({
        path: "posts",
        select: "content fileContent likes user date",
        options: { sort: { date: -1 } },
        populate: { path: "user", select: "username avatar" },
      })
      .lean();

    if (!user) return res.status(404).send("User not found");

    res.render("others_profile", {
      user,
      success_msg: res.locals.success_msg,
      error_msg: res.locals.error_msg,
      message: res.locals.message,
    });
  } catch (err) {
    console.error("View profile error:", err);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/feed");
  }
};

// -------- DELETE ACCOUNT PAGE --------
export const deleteAccountPage = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).send("User not found");

    res.render("deleteAccount", { user });
  } catch (err) {
    console.error("Delete account page error:", err);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/feed");
  }
};

// -------- DELETE ACCOUNT ACTION --------
export const deleteAccountAction = async (req, res) => {
  try {
    const { confirmCheck, confirmText } = req.body;
    if (!confirmCheck || confirmText !== "DELETE") {
      return res.status(400).send("You must confirm deletion");
    }

    const deletedUser = await userModel.findByIdAndDelete(req.user._id);
    if (!deletedUser) return res.status(404).send("User not found");

    await postModel.deleteMany({ user: deletedUser._id });

    req.flash(
      "success_msg",
      "Account and all your posts deleted successfully."
    );
    res.redirect("/login");
  } catch (err) {
    console.error("Delete account action error:", err);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/feed");
  }
};

// -------- UPLOAD PROFILE PHOTO --------
export const uploadProfilephoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const uploaded = await uploadOnCloudinary(req.file.path);

    await userModel.findByIdAndUpdate(req.user._id, {
      avatar: uploaded.secure_url,
    });
    res.redirect("/profile");
  } catch (err) {
    console.error("Avatar upload error:", err);
    req.flash("error_msg", "Error uploading avatar");
    res.redirect("/profile");
  }
};

// -------- UPDATE COVER IMAGE --------
export const updateUsercoverImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No cover image uploaded");

    const uploaded = await uploadOnCloudinary(req.file.path);

    await userModel.findByIdAndUpdate(req.user._id, {
      coverImage: uploaded.secure_url,
    });
    res.redirect("/profile");
  } catch (err) {
    console.error("Cover image update error:", err);
    req.flash("error_msg", "Error updating cover image");
    res.redirect("/profile");
  }
};

// -------- FEED PAGE --------
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
