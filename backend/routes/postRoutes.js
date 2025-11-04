import express from "express";
import * as postController from "../controllers/postController.js";
import { isLoggedIn } from "../utils/isAuth.js";
import { upload } from "../middleware/multer.middleware.js";
import postModel from "../models/post.js";
import { AddComment } from "../controllers/comment.Controller.js";
import { deleteComment } from "../controllers/comment.Controller.js";
import { editComment } from "../controllers/comment.Controller.js";
import { likedByUser, likePost } from "../controllers/like.Controller.js";
import { likeComment } from "../controllers/like.Controller.js";
import { postAllLike } from "../controllers/like.Controller.js";
import { share, shareCount } from "../controllers/shareController.js";
import {
  isSavedByUser,
  saveCount,
  toggleSave,
} from "../controllers/savedController.js";

const router = express.Router();

//Post Like
router.get("/like/:postid", isLoggedIn, likePost);
router.get("/like/user/:postid", isLoggedIn, likedByUser);
router.get("/alllike/:postid", postAllLike);

//Share Post
router.get("/sharecount/:postid", shareCount);
router.get("/share/:postid", isLoggedIn, share);

//Save post
router.get("/savecount/:postid", saveCount);
router.get("/save/user/:postid", isLoggedIn, isSavedByUser);
router.get("/save/:postid", isLoggedIn, toggleSave);

//Post Owner
router.get("/owner/:postid", isLoggedIn, postController.getOwner);

//Creating post
router.post(
  "/post",
  isLoggedIn,
  upload.fields([
    { name: "imageContent", maxCount: 1 },
    { name: "videoContent", maxCount: 1 },
  ]),
  postController.createPost
);

//Delete Post
router.get("/post-delete/:postId", isLoggedIn, postController.deletePost);

//Edit post
router.post(
  "/update/:postid",
  isLoggedIn,
  upload.fields([
    { name: "imageContent", maxCount: 1 },
    { name: "videoContent", maxCount: 1 },
  ]),
  postController.updatePost
);

//Get post by Id
router.get("/post/:postid", postController.getPostById);

export default router;
