import Like from "../models/like.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";

//Handle like/dislike a post
export const likePost = async (req, res) => {
  try {
    const postId = req.params.postid;
    // console.log(postId);
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;

    let like = await Like.findOne({
      post: post._id,
      likedBy: userId,
    });

    if (like) {
      await Like.deleteOne({ _id: like._id });
      // console.log("DislIke route hit");
      return res.status(200).json({ message: "Unliked" });
    } else {
      await Like.create({ post: post._id, likedBy: userId });
      // console.log("lIke route hit");
      return res.status(200).json({ message: "Liked" });
    }
  } catch (err) {
    console.error("Like/unlike error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong during like or unlike" });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;

    let like = await Like.findOne({
      comment: comment._id,
      likedBy: userId,
    });

    if (like) {
      await Like.deleteOne({ _id: like._id });
      return res.status(200).json({ message: "Comment unliked" });
    } else {
      await Like.create({ comment: comment._id, likedBy: userId });
      return res.status(200).json({ message: "Comment liked" });
    }
  } catch (err) {
    console.error("Like/unlike error:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong during like or unlike" });
  }
};

export const postAllLike = async (req, res) => {
  try {
    const { postid } = req.params;

    // console.log(postid);
    // Find all likes for the given post ID with populated likedBy user info
    const likes = await Like.find({ post: postid })
      .populate("likedBy", "username avatar") // user ke selected fields populate kar rahe hain
      .sort({ createdAt: -1 }); // latest pehle

    // console.log("AllLikeUpdated")
    return res.status(200).json({
      message: "All likes for the post fetched successfully",
      likes,
    });
  } catch (error) {
    console.error("Error fetching post likes:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching likes",
    });
  }
};

export const likedByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postid;
    const like = await Like.findOne({
      likedBy: userId,
      post: postId,
    });

    if (!like) {
      return res.status(200).json({ isLiked: false });
    }
    return res.status(200).json({ isLiked: true });
  } catch (error) {
    return res.status(500).json({ message: "something went wrong" });
  }
};
