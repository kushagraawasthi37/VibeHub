import express from "express";
import { isLoggedIn } from "../utils/isAuth.js";
import { AddComment, allComment } from "../controllers/comment.Controller.js";
import { deleteComment } from "../controllers/comment.Controller.js";
import { editComment } from "../controllers/comment.Controller.js";
import { likeComment } from "../controllers/like.Controller.js";

const router = express.Router();
router.get("/allcomment/:postId", allComment);
router.post("/add/:postId", isLoggedIn, AddComment);
router.post("/edit/:commentId", isLoggedIn, editComment);
router.post("/delete/:commentid", isLoggedIn, deleteComment);
router.post("/like/:commentId", isLoggedIn, likeComment);

export default router;
