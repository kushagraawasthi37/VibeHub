// controllers/postController.js
import postModel from "../models/post.js";
import userModel from "../models/user.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Saved from "../models/saved.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Share from "../models/share.js";

// -------- UPDATE POST --------
export const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    let imageContent = null;
    let videoContent = null;

    console.log(req.files);

    // ✅ Handle image and video uploads like createPost
    if (req?.files?.imageContent && req?.files?.imageContent.length > 0) {
      const uploaded = await uploadOnCloudinary(req.files.imageContent[0].path);
      imageContent = uploaded?.secure_url || null;
    }

    if (req?.files?.videoContent && req?.files?.videoContent.length > 0) {
      const uploaded = await uploadOnCloudinary(req.files.videoContent[0].path);
      videoContent = uploaded?.secure_url || null;
    }

    // ❌ Restrict both image and video at once
    if (imageContent && videoContent) {
      return res.status(400).json({
        message: "You can upload only one media file (image OR video).",
      });
    }

    // ✅ Ensure something to update
    if (!content && !imageContent && !videoContent) {
      return res.status(400).json({
        message: "Please provide something to update (text or media).",
      });
    }

    // ✅ Find and check authorization
    const post = await postModel.findById(req.params.postid);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Build update object
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (imageContent) {
      updates.imageContent = imageContent;
      updates.videoContent = null; // clear previous video if updating to image
    }
    if (videoContent) {
      updates.videoContent = videoContent;
      updates.imageContent = null; // clear previous image if updating to video
    }

    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.postid,
      updates,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
};

// Get post owner
export const getOwner = async (req, res) => {
  try {
    const { postid } = req.params; // ✅ remove parentheses
    if (!postid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await postModel.findById(postid);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the owner" });
    }
    const isOwner = true;
    return res.status(200).json({ message: "You are the owner", isOwner });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong, try again later",
    });
  }
};

//delete post
export const deletePost = async (req, res) => {
  try {
    console.log("hit");
    const { postId } = req.params;
    console.log(postId);
    if (!postId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the post by ID
    const post = await postModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete related comments
    await Comment.deleteMany({ post: postId });

    // Get comment IDs to delete likes on them
    const commentIds = await Comment.find({ post: postId }).select("_id");
    await Like.deleteMany({
      $or: [
        { post: postId },
        { comment: { $in: commentIds.map((c) => c._id) } },
      ],
    });

    // Delete saved entries
    await Saved.deleteMany({ post: postId });

    // Delete the post
    await postModel.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};

//Create post
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let imageContent = null;
    let videoContent = null;

    console.log(req.files);

    if (req?.files?.imageContent) {
      const uploaded = await uploadOnCloudinary(
        req.files?.imageContent[0].path
      );
      imageContent = uploaded?.secure_url || null;
    }
    if (req?.files?.videoContent) {
      const uploaded = await uploadOnCloudinary(
        req.files?.videoContent[0].path
      );
      videoContent = uploaded?.secure_url || null;
    }
    console.log(content);
    console.log(videoContent);
    console.log(imageContent);

    if (!content && !imageContent && !videoContent) {
      return res.status(401).json({ message: "Post must have some content" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await postModel.create({
      user: user._id,
      content,
      imageContent,
      videoContent,
    });

    res.status(201).json({ message: "Post created succesfully", user, post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({
      message: "Something went wrong.Try again later",
    });
  }
};

//Get post by id
export const getPostById = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { postid } = req.params;

    if (!postid) {
      return res.status(400).json({ message: "Post ID required" });
    }

    // Step 1️⃣ — Fetch the post and populate basic user info
    const post = await postModel.findById(postid)
      .populate({
        path: "user",
        select: "username avatar bio privateAccount",
      })
      .lean();

    if (!post || !post.user) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Step 2️⃣ — Fetch stats in parallel (single-post version)
    const [likeCount, commentCount, saveCount, shareCount, userLike, userSave] =
      await Promise.all([
        Like.countDocuments({ post: postid }),
        Comment.countDocuments({ post: postid }),
        Saved.countDocuments({ post: postid }),
        Share.countDocuments({ post: postid }),
        Like.exists({ post: postid, likedBy: userId }),
        Saved.exists({ post: postid, user: userId }),
      ]);

    // Step 3️⃣ — Attach stats
    const finalPost = {
      ...post,
      stats: {
        likes: likeCount,
        comments: commentCount,
        saves: saveCount,
        shares: shareCount,
        isLiked: !!userLike,
        isSaved: !!userSave,
      },
    };

    // Step 4️⃣ — Send response
    return res.status(200).json({
      message: "Post fetched successfully",
      post: finalPost,
    });
  } catch (err) {
    console.error("Get post by ID error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Try again later." });
  }
};
