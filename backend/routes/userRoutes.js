import express from "express";
import * as userController from "../controllers/userController.js";
import { isLoggedIn } from "../utils/isAuth.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  acceptRequest,
  Follower,
  followerCount,
  followingCount,
  isFollower,
} from "../controllers/connection.Controller.js";
import { userSavedContent } from "../controllers/savedController.js";
import {
  deleteConversation,
  getALLConversation,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/search/user", isLoggedIn, userController.searchUsers);

// Route to view another user's profile
router.get("/user/:username", isLoggedIn, userController.viewOtherProfile);

//Updated routes

//Public Feed Pafe
router.get("/feed", isLoggedIn, userController.getFeedLoggedIn);

//Home route
router.get("/home", isLoggedIn, userController.getHomeLoggedIn);

//CurrentUser
router.get("/currentuser", isLoggedIn, userController.currentUser);
router.get("/profileadmin/:userid", userController.currentUserById);

//Managing private and public account
router.get("/account/privacy", isLoggedIn, userController.privacy);
router.get("/account/acceptrequest/:requestId", isLoggedIn, acceptRequest);

//Follower and Following
router.get("/follow/:adminid", isLoggedIn, Follower);
router.get("/follower/:adminid", isLoggedIn, followerCount);
router.get("/following/:adminid", isLoggedIn, followingCount);
router.get("/isfollower/:adminid", isLoggedIn, isFollower);

//Current user saved content
router.get("/savedcontent", isLoggedIn, userSavedContent);

//Current user all post
router.get("/userpost/:adminid", isLoggedIn, userController.userAllPost);
router.get(
  "/uservideopost/:adminid",
  isLoggedIn,
  userController.userAllVideoPost
);

//Current user is owner of page
router.get("/owner/:adminid", isLoggedIn, userController.isCurrentUserIsOwner);

//Updating the user profile
router.post(
  "/profile/update-details/:userid",
  isLoggedIn,
  upload.single("avatar"),
  userController.updateDetails
);

//delete your account permanently
router.post(
  "/delete-account/:userid",
  isLoggedIn,
  userController.deleteAccountAction
);

//Get otherusers
router.get("/getotherusers", isLoggedIn, userController.getOtherUsers);
//Get user all conversations
router.get("/getallconversations", isLoggedIn, getALLConversation);
router.delete(
  "/conversation/delete/:conversationId",
  isLoggedIn,
  deleteConversation
);

export default router;
