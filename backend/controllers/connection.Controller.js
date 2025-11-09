import Connection from "../models/connection.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const followerCount = async (req, res) => {
  try {
    const { adminid } = req.params;
    if (!adminid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const follower = await Connection.countDocuments({
      Admin: adminid,
      status: "accepted",
    });
    res.status(200).json({ followerCount: follower });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong.Try again later",
    });
  }
};

export const followingCount = async (req, res) => {
  try {
    const { adminid } = req.params;
    if (!adminid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const following = await Connection.countDocuments({
      follower: adminid,
      status: "accepted",
    });
    res.status(200).json({ followingCount: following });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong.Try again later",
    });
  }
};

//switching follow and unfollow
export const Follower = async (req, res) => {
  try {
    const { adminid } = req.params;
    const userId = req.user._id;
    if (!adminid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await User.findById(adminid);
    if (!admin) return res.status(404).json({ message: "User not found" });

    const follows = await Connection.findOne({
      Admin: adminid,
      follower: userId,
    });

    if (follows) {
      await Connection.findByIdAndDelete(follows._id);
      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      if (admin.privateAccount) {
        await Connection.create({
          Admin: adminid,
          follower: userId,
          status: "pending",
        });
        return res
          .status(201)
          .json({ message: "Follow request sent successfully" });
      } else {
        await Connection.create({
          Admin: adminid,
          follower: userId,
          status: "accepted",
        });
        return res.status(201).json({ message: "Followed successfully" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong. Try again later" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // ye ID follow request ki document ID hogi
    const adminId = req.user._id; // jo accept kar raha hai (jo follow ho raha hai)
    if (!requestId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Find the follow request jisme admin user pending request ko accept karega
    const request = await Connection.findOne({
      _id: requestId,
      Admin: adminId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Follow request not found or already processed" });
    }

    // Update status to accepted
    request.status = "accepted";
    await request.save();

    return res
      .status(200)
      .json({ message: "Follow request accepted successfully" });
  } catch (error) {
    console.error("Accept request error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const isFollower = async (req, res) => {
  try {
    const { adminid } = req.params;
    if (!adminid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // console.log("Received adminid param:", adminid);
    // console.log("Type of adminid:", typeof adminid);
    const userId = req.user._id;

    // Also log if it's a valid ObjectId
    const isValid = mongoose.Types.ObjectId.isValid(adminid);
    // console.log("Is valid ObjectId:", isValid);

    // Proceed with your lookup only if valid
    if (!isValid) {
      return res.status(400).json({ message: "Invalid adminid parameter" });
    }
    const connection = await Connection.findOne({
      Admin: adminid,
      follower: userId,
      status: "accepted",
    });

    if (!connection) {
      return res.status(200).json({ isFollows: false });
    }
    return res.status(200).json({ isFollows: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong.Try again later" });
  }
};

