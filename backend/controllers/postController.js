// controllers/postController.js
import userModel from "../models/user.js";
import postModel from "../models/post.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// -------- CREATE POST --------
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


// -------- EDIT POST PAGE --------
export const editPostPage = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");
    if (!post) return res.status(404).send("Post not found");

    if (post.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    res.render("edit", { post, user: post.user });
  } catch (err) {
    console.error("Load edit post page error:", err);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/profile");
  }
};

// -------- UPDATE POST --------
export const updatePost = async (req, res) => {
  try {
    const { updatedcontent } = req.body;
    const updates = { content: updatedcontent || "" };

    if (!updatedcontent && !req.file) {
      req.flash("error_msg", "Post must have text or an image.");
      return res.redirect("/profile");
    }

    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      updates.fileContent = uploaded?.secure_url || null;
    }

    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    await postModel.findByIdAndUpdate(req.params.id, updates);
    res.redirect("/profile");
  } catch (err) {
    console.error("Update post error:", err);
    req.flash("error_msg", "Failed to update post.");
    res.redirect("/profile");
  }
};

// -------- DELETE POST --------
export const deletePost = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    const user = await userModel.findById(post.user);
    user.posts = user.posts.filter((p) => p.toString() !== post._id.toString());
    await user.save();

    await postModel.findByIdAndDelete(post._id);
    res.redirect("/profile");
  } catch (err) {
    console.error("Delete post error:", err);
    req.flash("error_msg", "Failed to delete post.");
    res.redirect("/profile");
  }
};
