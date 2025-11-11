import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;
    const { message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Fix query
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(201).json({
      message: "Message created",
      newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

// ✅ getMessages.js
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherParticipantId } = req.params;
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(10, parseInt(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    if (!myId || !otherParticipantId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [myId, otherParticipantId] },
    })
      .populate({
        path: "messages",
        populate: [
          { path: "senderId", select: "-password " }, // populate senderId, omit sensitive fields
          { path: "receiverId", select: "-password " }, // populate receiverId similarly
        ],
      })
      .populate("participants", "username avatar email")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Conversation found successfully",
      conversation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong. Try again later",
    });
  }
};

// ✅ getALLConversation.js
export const getALLConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.min(10, parseInt(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    const allConversation = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username email avatar")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "All conversations fetched successfully",
      allConversation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Try again later" });
  }
};

// ✅ Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newContent } = req.body;

    const message = await Message.findById(messageId);
    console.log(message);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only owner can edit
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this message" });
    }

    message.message = newContent;

    console.log(message.content);
    await message.save();

    console.log(message);
    await message.populate([
      { path: "senderId", select: "username avatar" },
      { path: "receiverId", select: "username avatar" },
    ]);
    res.status(200).json({
      message: "Message updated successfully",
      updatedMessage: message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    // Remove message from conversation
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    await message.deleteOne();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete an entire conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Only a participant can delete the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this conversation" });
    }

    // Delete all related messages
    await Message.deleteMany({ _id: { $in: conversation.messages } });

    // Delete the conversation
    await conversation.deleteOne();

    res
      .status(200)
      .json({ message: "Conversation and messages deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
