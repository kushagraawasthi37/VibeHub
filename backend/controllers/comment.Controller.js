import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Post from "../models/post.js";

export const AddComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!postId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment content required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(403).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const comment = await Comment.create({
      owner: userId,
      content,
      post: post._id,
    });

    return res
      .status(201)
      .json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Try again later" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    // console.log("hit");
    // console.log("Comment Id ", commentId);
    // console.log("User id ", req.user._id);

    if (!commentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const comment = await Comment.findOne({
      owner: req.user._id,
      _id: commentId,
    });

    if (!comment) {
      return res.status(403).json({ message: "Only owner can delete comment" });
    }

    await Like.findOneAndDelete({ comment: comment._id });

    await Comment.findByIdAndDelete(comment._id);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log("Comment delete error", error);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await Comment.findOne({
      owner: req.user._id,
      _id: commentId,
    });

    if (!comment) {
      return res.status(403).json({ message: "Only owner can edit comment" });
    }

    await Comment.findByIdAndUpdate(comment._id, { content }, { new: true });
    return res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

export const allComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(20, parseInt(req.query.limit)) || 20;
    const skip = (page - 1) * limit;

    if (!postId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const comments = await Comment.find({ post: postId })
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = comments.length;

    return res
      .status(200)
      .json({ message: "All comments fetched", comments, total });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
