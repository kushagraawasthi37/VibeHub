import express from "express";
import * as userController from "../controllers/userController.js";
import { isLoggedIn } from "../utils/isAuth.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  acceptRequest,
  Follower,
  followerCount,
  followingCount,
} from "../controllers/connection.Controller.js";
import { userSavedContent } from "../controllers/savedController.js";

const router = express.Router();

router.get("/profile", isLoggedIn, userController.getProfile);

router.get("/feed", userController.getFeed);
router.get(
  "/feed/profile/:username",
  isLoggedIn,
  userController.viewOtherProfile
);

router.get("/search/user", userController.searchPage);
router.post("/search/user", userController.searchUsers);

router.get(
  "/delete-account/:username",
  isLoggedIn,
  userController.deleteAccountPage
);
router.post(
  "/delete-account/:username",
  isLoggedIn,
  userController.deleteAccountAction
);
router.post(
  "/profile/upload-avatar",
  isLoggedIn,
  upload.single("avatar"),
  userController.uploadProfilephoto
);

router.post(
  "/profile/cover",
  isLoggedIn,
  upload.single("coverImage"),
  userController.updateUsercoverImage
);

// Route to view another user's profile
router.get("/user/:username", userController.viewOtherProfile);

//Updated routes

//Home route

router.get("/home", userController.getHome);

//CurrentUser
router.get("/currentuser", isLoggedIn, userController.currentUser);

//Managing private and public account
router.get("/account/privacy", isLoggedIn, userController.privacy);
router.get("/account/acceptrequest/:requestId", isLoggedIn, acceptRequest);

//Follower and Following
router.get("/follow/:adminid", isLoggedIn, Follower);
router.get("/follower", isLoggedIn, followerCount);
router.get("/following", isLoggedIn, followingCount);


//Current user saved content
router.get("/savedcontent", isLoggedIn, userSavedContent);


export default router;
