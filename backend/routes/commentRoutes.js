import express from "express";
import { isLoggedIn } from "../utils/isAuth.js";
import { AddComment, allComment } from "../controllers/comment.Controller.js";
import { deleteComment } from "../controllers/comment.Controller.js";
import { editComment } from "../controllers/comment.Controller.js";
import { getAllLikesOfComment, likeComment } from "../controllers/like.Controller.js";

const router = express.Router();
router.get("/allcomment/:postId", allComment);
router.post("/add/:postId", isLoggedIn, AddComment);
router.post("/edit/:commentId", isLoggedIn, editComment);
router.post("/delete/:commentId", isLoggedIn, deleteComment);
router.post("/like/:commentId", isLoggedIn, likeComment);
router.get("/all/:commentId", getAllLikesOfComment);

export default router;
