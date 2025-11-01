import Connection from "../models/comment.js";

export const followerCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const follower = await Connection.countDocuments({
      Admin: userId,
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
    const userId = req.user._id;
    const following = await Connection.countDocuments({
      follower: userId,
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
    const { adminId } = req.params;
    const userId = req.user._id;

    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ message: "User not found" });

    const follows = await Connection.findOne({
      Admin: adminId,
      follower: userId,
    });

    if (follows) {
      await Connection.findByIdAndDelete(follows._id);
      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      if (admin.privateAccount) {
        await Connection.create({
          Admin: adminId,
          follower: userId,
          status: "pending",
        });
        return res
          .status(201)
          .json({ message: "Follow request sent successfully" });
      } else {
        await Connection.create({
          Admin: adminId,
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
