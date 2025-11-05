import express from "express";
import { isLoggedIn } from "../utils/isAuth.js";
import {
  deleteConversation,
  deleteMessage,
  editMessage,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

//Send message
router.post("/send/:receiverId", isLoggedIn, sendMessage);
router.get("/get-message/:otherParticipantId", isLoggedIn, getMessages);
router.put("/edit/:messageId", isLoggedIn, editMessage);
router.delete("/delete/:messageId", isLoggedIn, deleteMessage);
export default router;
